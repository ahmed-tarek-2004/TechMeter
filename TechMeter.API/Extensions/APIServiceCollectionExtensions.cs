using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using TechMeter.API.Services;
using TechMeter.Application.Behaviors;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Application.Interfaces.NotificationSender;
using TechMeter.Application.Service;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Shared;


namespace TechMeter.Extensions
{
    public static class APIServiceCollectionExtensions
    {
        public static IHostBuilder UseSerilogLogging(this IHostBuilder hostBuilder)
        {
            return hostBuilder.UseSerilog((context, services, configuration) =>
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
        public static IServiceCollection AddAuthenticationAndAuthorization(this IServiceCollection services, IConfiguration configuration)
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

            services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultForbidScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var jwtSettings = configuration.GetSection("JWT").Get<JwtSettings>();
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = !string.IsNullOrEmpty(jwtSettings.Issuer),
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = !string.IsNullOrEmpty(jwtSettings.Audience),
                    ValidAudience = jwtSettings.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
                    ValidateLifetime = true,
                    RequireSignedTokens = true,
                    ClockSkew = TimeSpan.Zero,
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var path = context.HttpContext.Request.Path;
                        var token = context.Request.Query["access_token"];
                        if (!string.IsNullOrEmpty(token) && ((path.StartsWithSegments("/notificationHub") || (path.StartsWithSegments("/messageHub")))))
                        {
                            context.Token = token;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            return services;
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

        public static IServiceCollection AddEmailServices(this IServiceCollection services, IConfiguration configuration)
        {
            var emailSettings = configuration.GetSection("EmailSettings").Get<Shared.EmailSettings>();

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


                options.AddPolicy("TogglePolicy", context =>
                {
                    var key = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";

                    return RateLimitPartition.GetTokenBucketLimiter(
                        partitionKey: key,
                        factory: _ => new TokenBucketRateLimiterOptions
                        {
                            TokenLimit = 5,
                            TokensPerPeriod = 1,
                            ReplenishmentPeriod = TimeSpan.FromSeconds(2),

                            QueueLimit = 0,
                            AutoReplenishment = true
                        });
                });

                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

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

        public static IServiceCollection ApplyingMediatoR_Requirements(this IServiceCollection services)
        {
            services.AddMediatR(options => options.RegisterServicesFromAssembly(typeof(IAssemblyMarker).Assembly));
            services.AddValidatorsFromAssembly(typeof(IAssemblyMarker).Assembly);
            //services.AddFluentValidationAutoValidation();
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            return services;
        }
        public static IServiceCollection AddAPiDependencyInjection(this IServiceCollection services)
        {
            services.AddScoped<INotificationSenderService, NotificationSenderService>();
            return services;
        }

    }
}
