using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Connections.Features;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.CodeAnalysis.Options;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TechMeter;
using TechMeter.API.Common.Exceptions;
using TechMeter.API.Common.Middleware;
using TechMeter.Application.Behaviors;
using TechMeter.Application.Common;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Extensions;
using TechMeter.Infrastructure.Adapters.Cloudinary;
using TechMeter.Infrastructure.Adapters.JwtSettings;
using TechMeter.Infrastructure.Extensions;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Infrastructure.Seeder;

namespace TechMeter
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllers();

            builder.Host.UseSerilogLogging();

            builder.Services.AddControllers()
             .ConfigureApiBehaviorOptions(options =>
             options.SuppressModelStateInvalidFilter = true)
             .AddJsonOptions(option =>
             {
                 option.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
             });


            builder.Services.AddSwaggerConfiguration();
            builder.Services.AddDatabase(builder.Configuration);
            builder.Services.AddEmailServices(builder.Configuration);
            builder.Services.AddDistributedCache(builder.Configuration);
            builder.Services.AddScoped<ResponseHandler>();
            builder.Services.AddAuthenticationAndAuthorization(builder.Configuration);
            builder.Services.ApplicationService();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JWT"));
            builder.Services.AddingStripePayment(builder.Configuration);
            builder.Services.ApplyingMediatoR_Requirements();
           

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

            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddProblemDetails();

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
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseMiddleware<StopwatchRequestMiddleware>();
            app.UseExceptionHandler();
            app.MapControllers();

            app.Run();
        }
    }
}
