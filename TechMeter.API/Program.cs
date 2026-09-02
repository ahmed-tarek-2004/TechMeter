
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;
using TechMeter.API.Common.Exceptions;
using TechMeter.API.Common.Middleware;
using TechMeter.API.Hubs;
using Microsoft.OpenApi;

//using TechMeter.API.Hubs;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Extensions;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Extensions;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using TechMeter.Infrastructure.BackgroundJob.Dashboard;
using TechMeter.Shared;
using TechMeter.Infrastructure.Persistence.Seeder;
using TechMeter.Infrastructure.Persistence.AppDbContext;

namespace TechMeter
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();

            builder.Host.UseSerilogLogging();
            FirebaseApp.Create(new AppOptions()
            {
                Credential = GoogleCredential.FromFile("Firebase//firebase.json")
            });


            builder.Services.AddControllers()
             .ConfigureApiBehaviorOptions(options =>
             options.SuppressModelStateInvalidFilter = true)
             .AddJsonOptions(option =>
             {
                 option.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
             });

            builder.Services.AddSignalR();

            builder.Services.AddHangfire(config =>
            {
                config.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(builder.Configuration.GetConnectionString("Hangfire"), new SqlServerStorageOptions
                {
                    CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
                    SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
                    QueuePollInterval = TimeSpan.FromSeconds(12),
                    UseRecommendedIsolationLevel = true,
                    DisableGlobalLocks = true
                });
            });
            builder.Services.AddHangfireServer();

            builder.Services.AddSwaggerConfiguration();
            builder.Services.AddDatabase(builder.Configuration);
            builder.Services.AddEmailServices(builder.Configuration);
            builder.Services.AddDistributedCache(builder.Configuration);
            builder.Services.AddScoped<ResponseHandler>();
            builder.Services.AddAuthenticationAndAuthorization(builder.Configuration);
            builder.Services.ApplicationService();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.Configure<Shared.CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
            builder.Services.Configure<Shared.JwtSettings>(builder.Configuration.GetSection("JWT"));
            builder.Services.AddingStripePayment(builder.Configuration);
            builder.Services.ApplyingMediatoR_Requirements();
            //builder.Services.AddAutoMapper(typeof(Program).Assembly);
            builder.Services.AddAPiDependencyInjection();
            builder.Services.AddOpenApi();

            builder.Services.AddDataProtection()
              .PersistKeysToDbContext<ApplicationDbContext>()
              .SetApplicationName("TechMeter");



            builder.Services.AddCors(opt =>
                {
                    opt.AddPolicy("AllowAll",
                        policy =>
                        {
                            policy.AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials()
                            .SetIsOriginAllowed(_ => true);
                        });
                });

            builder.Services.AddProblemDetails();
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddTransient<StopwatchRequestMiddleware>();
            var app = builder.Build();

            await using (var scope = app.Services.CreateAsyncScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Domain.Models.Auth.Identity.Role>>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<UserAndRoleSeeder>>();
                await UserAndRoleSeeder.Seed(context, roleManager, userManager, logger);
            }


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
            {
                //app.MapOpenApi();
                //app.MapScalarApiReference();
                app.UseSwagger();
                app.UseSwaggerUI();
            }


            app.UseExceptionHandler();
            //app.UseProblemDetails();
            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseMiddleware<StopwatchRequestMiddleware>();
            app.MapHub<NotificationHub>("/notificationHub").RequireAuthorization();
            app.MapHub<MessgaeHub>("/messageHub").RequireAuthorization();

            //BackgroundJob.Schedule(() => Console.WriteLine("Hello From Scheduled TechMeter"), TimeSpan.FromSeconds(60));
            //BackgroundJob.Enqueue(() => Console.WriteLine("Hello From Enqueue TechMeter"));
            app.MapControllers();
            app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = new[] { new AllowAllDashboardAuthorizationFilter() }
            });

            
            app.Run();
        }
    }
}
