using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Service;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.Cloudinary;
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

        public static IServiceCollection ApplicationService(this IServiceCollection services)
        {
            services.AddScoped<OTPService>();
            services.AddScoped<IImageUploading, CloudinaryImageService>();
            return services;
        }
    }
}
