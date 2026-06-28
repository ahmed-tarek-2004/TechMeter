using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Payment.Command.Checkout;
using TechMeter.Application.Features.Payment.Command.PaymentIntent;
using TechMeter.Application.Features.Payment.Query.AdminTransaction;
using TechMeter.Application.Features.Payment.Query.ProviderQuery;
using TechMeter.Application.Interfaces.Payment;
using TechMeter.Domain.Shared.Bases;


namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IMediator _mediator;
        public readonly ResponseHandler _responseHandler;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ResponseHandler responseHandler,
            ILogger<PaymentController> logger, IMediator mediator)
        {
            _paymentService = paymentService;
            _responseHandler = responseHandler;
            _logger = logger;
            _mediator = mediator;
        }

        [HttpPost("check-out")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<PaymentResponse>> CheckoutAsync([FromBody] PaymentRequest request)
        {
            var command = new PaymentIntentCommand
            {
                currency = request.Currency,
                orderId = request.OrderId,
            };
            command.studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(command);

            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("create-payment-intent")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<PaymentIntentResponse>>> CreatePaymentIntent([FromBody] PaymentRequest request)
        {

            var command = new PaymentIntentCommand
            {
                currency = request.Currency,
                orderId = request.OrderId,
            };
            command.studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(command);

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
        public async Task<ActionResult<PaymentResponse>> GetAdminAllTransactionAsync(string? providerId, [FromQuery] DateTime? from, DateTime? to, int pageNumber = 1, int pageSiaze = 10)
        {
            var response = await _mediator.Send(new AdminTransactionQuery
            {
                providerId = providerId,
                from = from,
                to = to,
                pageNumber = pageNumber,
                pageSize = pageSiaze
            });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("provider/all/transaction")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<PaymentResponse>> GetProviderAllTransactionAsync([FromQuery] DateTime? from, DateTime? to, int pageNumber = 1, int pageSiaze = 10)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(new ProviderTransactionQuery
            {
                providerId = providerId!,
                from = from,
                to = to,
                pageNumber = pageNumber,
                pageSize = pageSiaze
            });
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
