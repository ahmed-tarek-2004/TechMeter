using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using System.Net;
using System.Net.Mail;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Application.Interfaces.OTPService;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Application.Interfaces.TokenService;
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Application.Service.OTPService;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Infrastructure.Services.AuthService;
using TechMeter.Infrastructure.Services.Cart;
using TechMeter.Infrastructure.Services.Category;
using TechMeter.Infrastructure.Services.CourseService;
using TechMeter.Infrastructure.Services.Lesson;
using TechMeter.Infrastructure.Services.SectionService;
using TechMeter.Infrastructure.Services.WishList;

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
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICourseService, CourseService>();
            services.AddScoped<ISectionService, SectionService>();
            services.AddScoped<ILessonService, LessonService>();
            services.AddScoped<IWishListService, WishListService>();
            services.AddScoped<ICartService, CartService>();

            return services;
        }
    }
}
