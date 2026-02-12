using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using System.Net;
using System.Net.Mail;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Application.Interfaces.OTPService;
using TechMeter.Application.Interfaces.TokenService;
using TechMeter.Application.Service.OTPService;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Infrastructure.Services.AuthService;

namespace TechMeter.Infrastructure.Extensions
{
    public static class InfrustructureServiceCollectionExtensions
    {
        public static IServiceCollection AddDatabase(this IServiceCollection service, IConfiguration configuration)
        {
            service.AddDbContext<ApplicationDbContext>(opt =>
            {
                opt.UseSqlServer(configuration.GetConnectionString("DevCS"));
            });
            return service;
        }
        public static IServiceCollection AddDistributedCache(this IServiceCollection services, IConfiguration configurations)
        {
            services.AddSingleton<IConnectionMultiplexer>(cm =>
            {
                var configuration = ConfigurationOptions.Parse(configurations.GetConnectionString("Redis")!);
                configuration.AbortOnConnectFail = false;
                return ConnectionMultiplexer.Connect(configuration);
            });
            return services;
        }

        public static IServiceCollection ApplicationService(this IServiceCollection services)
        {
            services.AddScoped<IOTPService,OTPService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IImageUploading, CloudinaryImageService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAuthService, AuthService>();
            return services;
        }
    }
}
