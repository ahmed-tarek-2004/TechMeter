using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Webhook.Command;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Webhook")]
    [Produces("application/json")]
    public class WebhookController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<PaymentController> _logger;

        public WebhookController(ILogger<PaymentController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        [HttpPost("HandleWebHook")]
        [AllowAnonymous]
        [SwaggerOperation(
            Summary = "Handle Stripe webhook event",
            Description = "Public endpoint consumed by Stripe. Validates the Stripe-Signature header and processes payment lifecycle events (e.g. payment_intent.succeeded, checkout.session.completed) to fulfil orders automatically.",
            OperationId = "Webhook_HandleStripe",
            Tags = new[] { "Webhook" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Webhook event processed successfully", typeof(PaymentResponse))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Missing or invalid Stripe-Signature header")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error while processing event")]
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
            var response = await _mediator.Send(new ConfirmWebhookCommand(json, signature));
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
