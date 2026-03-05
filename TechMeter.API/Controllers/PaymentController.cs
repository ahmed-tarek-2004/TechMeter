using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using System.Net;
using System.Security.Claims;
using TechMeter.API.Validators.Payment;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Interfaces.Payment;
using TechMeter.Domain.Shared.Bases;


namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        public readonly ResponseHandler _responseHandler;
        private readonly ILogger<PaymentController> _logger;
        private readonly IValidator<PaymentRequest> _paymentRequestValidator;

        public PaymentController(IPaymentService paymentService, IValidator<PaymentRequest> paymentRequestValidator,
            ResponseHandler responseHandler, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _paymentRequestValidator = paymentRequestValidator;
            _responseHandler = responseHandler;
            _logger = logger;
        }

        [HttpPost("check-out")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<PaymentResponse>> CheckoutAsync([FromBody] PaymentRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _paymentService.CreateACheckOut(userId, request);

            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("create-payment-intent")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<PaymentIntentResponse>>> CreatePaymentIntent([FromBody] PaymentRequest request)
        {
            var Validation = await _paymentRequestValidator.ValidateAsync(request);
            if (!Validation.IsValid)
            {
                var Error = string.Join(',', Validation.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<PaymentResponse>(Error));
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _paymentService.PaymentIntentService(userId, request);

            return StatusCode((int)response.StatusCode, response);

        }
        [HttpPost("HandleWebHook")]
        [AllowAnonymous]
        public async Task<ActionResult<PaymentResponse>> HandleWebHookAsync()
        {
            var signature = Request.Headers["Stripe-Signature"];
            _logger.LogInformation("Starting the WebHook ...");
            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Missing Stripe-Signature header");
                return BadRequest("Missing Stripe-Signature header");
            }
            using var reader = new StreamReader(HttpContext.Request.Body);
            var json = await reader.ReadToEndAsync();
            var response = await _paymentService.HandleWebHookAsync(json, signature);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("admin/all/transaction")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<PaymentResponse>> GetAdminAllTransactionAsync([FromQuery] DateTime? from, DateTime? to, int pageNumber = 1, int pageSiaze = 10)
        {
            var response = await _paymentService.GetAllAdminTransaction(from,to,pageNumber,pageSiaze);
            return StatusCode((int)response.StatusCode, response);
        }
        
        [HttpGet("provider/all/transaction")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<PaymentResponse>> GetProviderAllTransactionAsync([FromQuery] DateTime? from, DateTime? to, int pageNumber = 1, int pageSiaze = 10)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _paymentService.GetAllProviderTransaction(providerId!,from,to,pageNumber,pageSiaze);
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
