using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Webhook.Command;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
