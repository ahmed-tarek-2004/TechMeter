
using Microsoft.AspNetCore.Identity;
//using Microsoft.OpenApi.MicrosoftExtensions;
using Microsoft.OpenApi.Models;
using TechMeter.Domain.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Extensions;
using TechMeter.Infrastructure.Extensions;
using TechMeter;

namespace TechMeter
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
                .ConfigureApiBehaviorOptions(options =>
                options.SuppressModelStateInvalidFilter = true);
            
            
            //builder.Services.AddOpenApi();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            //builder.Services.AddOpenApi();

            builder.Services.AddSwaggerConfiguration();
            builder.Services.AddDatabase(builder.Configuration);
            builder.Services.AddScoped<ResponseHandlr>();
                
            builder.Services.AddEndpointsApiExplorer();//To See All EndPoint for Minimal Api

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                //app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
