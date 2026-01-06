using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Infrastructure.ApplicationContext;

namespace TechMeter.Infrastructure.Extensions
{
    public static class InfrustructureServiceCollectionExtensions
    {
        public static IServiceCollection AddDatabase(this IServiceCollection service,IConfiguration configuration)
        {
            service.AddDbContext<ApplicationDbContext>(opt =>
            {
                opt.UseSqlServer(configuration.GetConnectionString("DevCS"));
            });
            return service;
        }
    }
}
