using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using Stripe;
using System.Net;
using System.Net.Mail;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.Services;
using TechMeter.Application.Interfaces.Services.Auth;
using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Application.Interfaces.Services.Category;
using TechMeter.Application.Interfaces.Services.Course;
using TechMeter.Application.Interfaces.Services.Fcm;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Application.Interfaces.Services.Order;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Application.Interfaces.Services.Payment;
using TechMeter.Application.Interfaces.Services.Profile;
using TechMeter.Application.Interfaces.Services.Rating;
using TechMeter.Application.Interfaces.Services.Section;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Application.Interfaces.Services.WishList;
//using TechMeter.Application.Interfaces.
//using TechMeter.Application.Interfaces.UserProfile;
//using TechMeter.Application.Interfaces.WishList;
using TechMeter.Application.Service.OTPService;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.HangfireJobs;

//using TechMeter.Infrastructure.Jobs;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Infrastructure.Services;
using TechMeter.Infrastructure.Services.AuthService;
using TechMeter.Infrastructure.Services.Cart;
using TechMeter.Infrastructure.Services.Category;
using TechMeter.Infrastructure.Services.CourseService;
using TechMeter.Infrastructure.Services.Fcm;
using TechMeter.Infrastructure.Services.Lesson;
using TechMeter.Infrastructure.Services.LessonComment;
using TechMeter.Infrastructure.Services.Notification;

//using TechMeter.Infrastructure.Services.Notification;
using TechMeter.Infrastructure.Services.Order;
using TechMeter.Infrastructure.Services.Payment;
using TechMeter.Infrastructure.Services.Rating;
using TechMeter.Infrastructure.Services.SectionService;
using TechMeter.Infrastructure.Services.TokenService;
using TechMeter.Infrastructure.Services.User;
using TechMeter.Infrastructure.Services.UserConnection;
using TechMeter.Infrastructure.Services.WishList;
using TechMeter.Shared;
//using TokenService = TechMeter.Infrastructure.Services.;

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
            services.AddScoped<IOTPService, OTPService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IMediaUploading, CloudinaryImageService>();
            services.AddScoped<ITokenService,TechMeter.Infrastructure.Services.TokenService.TokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICourseService, CourseService>();
            services.AddScoped<ISectionService, SectionService>();
            services.AddScoped<ILessonService, LessonService>();
            services.AddScoped<IWishListService, WishListService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IRatingService, RatingService>();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<IApplicationDbContext, ApplicationDbContext>();//if not using repository and unitOfWork using AppDbContext interfacr
            //services.AddScoped<IEnrollmentNotificationJob, EnrollmentNotificationJob>();
            services.AddScoped<IBackgroundJobService, HangfireJobService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IFcmService, FcmService>();
            services.AddScoped<ILessonCommentAuthorization, LessonCommentAuthorization>();
            services.AddScoped<ILessonCommentService, LessonCommentService>();
            services.AddScoped<IUserConnectionService, UserConnectionService>();

            return services;
        }
        public static IServiceCollection AddingStripePayment(this IServiceCollection services, IConfiguration configuration)
        {

            services.Configure<StripeSettings>(configuration.GetSection("Stripe"));
            var stripeSettings = configuration.GetSection("Stripe").Get<StripeSettings>();
            StripeConfiguration.ApiKey = stripeSettings!.SecretKey;

            return services;
        }
    }
}
