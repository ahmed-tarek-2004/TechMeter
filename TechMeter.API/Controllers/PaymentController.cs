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
//using TechMeter.Application.Interfaces.Payment;
using TechMeter.Application.Interfaces.Services.Payment;
using TechMeter.Domain.Shared.Bases;


namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        public async Task<ActionResult<PaymentResponse>> CheckoutAsync([FromBody] PaymentRequest request)
        {
            var command = new CheckoutCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!, request.Currency);
            var response = await _mediator.Send(command);

            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("create-payment-intent")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<PaymentIntentResponse>>> CreatePaymentIntent([FromBody] PaymentRequest request)
        {

            var command = new PaymentIntentCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!, request.Currency);
            var response = await _mediator.Send(command);

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
