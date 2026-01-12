using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis;
using System.Net;
using System.Net.Mail;
using System.Threading.RateLimiting;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Service;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;


namespace TechMeter.Extensions
{
    public static class APIServiceCollectionExtensions
    {
        public static IHostBuilder UseSerilogLogging(this IHostBuilder hostBuilder)
        {
            return hostBuilder.UseSerilog((context, services,configuration) =>
            {
                Log.Logger = new LoggerConfiguration()
                   .WriteTo.Console()
                   .CreateBootstrapLogger();

                Log.Information("Starting up...");

                configuration.ReadFrom.Configuration(context.Configuration) 
                              .ReadFrom.Services(services) 
                              .Enrich.FromLogContext()
                              .Enrich.WithMachineName()
                              .Enrich.WithThreadId();
            });
        }
        public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
        {
            services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo { Title = "Tech Meter", Version = "v1" });
                option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });

                option.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
            return services;
        }

        public static IServiceCollection AddInfrastructureIdentity(this IServiceCollection services)
        {
            services.AddIdentity<User, Domain.Models.Auth.Identity.Role>(opt =>
            {
                opt.Password.RequireLowercase = true;
                opt.Password.RequireUppercase = true;
                opt.Password.RequiredLength = 8;
                opt.Password.RequireDigit = true;
                opt.Password.RequireNonAlphanumeric = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddRoleManager<RoleManager<Domain.Models.Auth.Identity.Role>>()
            .AddUserManager<UserManager<User>>()
            .AddDefaultTokenProviders();

            return services;
        }

        public static IServiceCollection AddEmailServices(this IServiceCollection services, IConfiguration configuration)
        {
            var emailSettings = configuration.GetSection("EmailSettings").Get<EmailSettings>();

            services.AddFluentEmail(emailSettings.FromEmail)
                .AddSmtpSender(new SmtpClient(emailSettings.SmtpServer)
                {
                    Port = emailSettings.SmtpPort,
                    Credentials = new NetworkCredential(emailSettings.Username, emailSettings.Password),
                    EnableSsl = emailSettings.EnableSsl,
                    UseDefaultCredentials = false,
                });

            return services;
        }

        public static IServiceCollection AddResendOtpRateLimiter(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.AddPolicy("SendOtpPolicy", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetClientIp(context),
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 3,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));
            });
            return services;
        }

        private static string GetClientIp(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
            {
                return forwardedFor.ToString().Split(',')[0];
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }
}
