using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.ApplicationContext;

namespace TechMeter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly ResponseHandlr _responseHanldr;

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, ApplicationDbContext dbContext,ResponseHandlr responseHandlr)
        {
            _logger = logger;
            context = dbContext;
            _responseHanldr = responseHandlr;
        }

        //[HttpPost("add/{quantity:int}")]
        //public IActionResult ResultAdd(int quantity)
        //{
        //    var order = new Order()
        //    {
        //        Id = Guid.NewGuid(),
        //        quantity = quantity
        //    };
        //    context.orders.Add(order);

        //    context.SaveChanges();
        //    //return _responseHanldr.Success<string>("ss","s");
        //}
        [HttpPost("buy")]
        public async Task<ActionResult<Response<string>>> Resultbut()
        {
            return _responseHanldr.Success<string>("ss","ass");
        }
    }
}
