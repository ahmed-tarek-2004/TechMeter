using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using Swashbuckle.AspNetCore.Annotations;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Payment.Command.Checkout;
using TechMeter.Application.Features.Payment.Command.PaymentIntent;
using TechMeter.Application.Features.Payment.Query.AdminTransaction;
using TechMeter.Application.Features.Payment.Query.ProviderQuery;
//using TechMeter.Application.Interfaces.Payment;
using TechMeter.Application.Interfaces.Services.Payment;
using TechMeter.Domain.Shared.Bases;


namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Payments")]
    [Produces("application/json")]
    public class PaymentController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(ILogger<PaymentController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        [HttpPost("check-out")]
        [Authorize(Roles = "student")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Checkout cart via Stripe",
            Description = "Requires JWT Bearer authentication with the student role. Creates a Stripe Checkout Session for the authenticated student's cart and returns the session URL to redirect the user to Stripe's payment page.",
            OperationId = "Payment_Checkout",
            Tags = new[] { "Payments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Stripe checkout session created successfully", typeof(PaymentResponse))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Cart is empty or payment initialization failed", typeof(PaymentResponse))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<PaymentResponse>> CheckoutAsync([FromBody] PaymentRequest request)
        {
            var command = new CheckoutCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!, request.Currency);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("create-payment-intent")]
        [Authorize(Roles = "student")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Create Stripe Payment Intent",
            Description = "Requires JWT Bearer authentication with the student role. Creates a Stripe Payment Intent for the authenticated student's cart and returns the client secret for use with Stripe Elements or the mobile SDK.",
            OperationId = "Payment_CreateIntent",
            Tags = new[] { "Payments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Payment Intent created successfully", typeof(Response<PaymentIntentResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Cart is empty or Payment Intent creation failed", typeof(Response<PaymentIntentResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaymentIntentResponse>>> CreatePaymentIntent([FromBody] PaymentRequest request)
        {
            var command = new PaymentIntentCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!, request.Currency);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("admin/all/transaction")]
        [Authorize(Roles = "admin")]
        [SwaggerOperation(
            Summary = "Get all transactions (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Returns a paginated list of all payment transactions on the platform, with optional filters by provider ID and date range.",
            OperationId = "Payment_AdminTransactions",
            Tags = new[] { "Payments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Transactions retrieved successfully", typeof(PaymentResponse))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
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
        [SwaggerOperation(
            Summary = "Get provider transactions",
            Description = "Requires JWT Bearer authentication with the provider role. Returns a paginated list of payment transactions for courses owned by the authenticated provider, with optional date range filters.",
            OperationId = "Payment_ProviderTransactions",
            Tags = new[] { "Payments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Provider transactions retrieved successfully", typeof(PaymentResponse))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
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
