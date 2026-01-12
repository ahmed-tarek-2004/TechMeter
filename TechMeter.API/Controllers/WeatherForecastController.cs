using TechMeter.Domain.Models;
using Microsoft.AspNetCore.Mvc;
using TechMeter.Application.Service;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Application.Interfaces;

namespace TechMeter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        //private readonly ApplicationDbContext context;
        private readonly ResponseHandler _responseHanldr;
        private readonly OTPService _otpService;
        private readonly IImageUploading _imageUploading;
        //private readonly ILogger<WeatherForecastController> logger;

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, ApplicationDbContext dbContext,
            ResponseHandler responseHandlr, OTPService otpService,IImageUploading imageUploading)
        {
            _logger = logger;
            _imageUploading = imageUploading;
            _responseHanldr = responseHandlr;
            _otpService = otpService;

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
        public async Task<ActionResult<Response<string>>> Resultbut(IFormFile?form)
        {
           var r= await _imageUploading.UploadAsync(form);
            return _responseHanldr.Success(r,"s");
        }
    }
}
