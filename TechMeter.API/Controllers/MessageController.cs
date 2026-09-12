using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Messeage;
using TechMeter.Application.Features.Message.Query;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController(IMediator mediator) : ControllerBase
    {
        [HttpGet("{receiverId}")]
        [Authorize]
        public async Task<ActionResult<Response<PaginatedList<MessageHistoryResponse>>>>ReturnHistoryMessagesAsync
            ([FromRoute] string receiverId, [FromQuery] PaginatedRequest paginatedRequest)
        {
            var response = await mediator.Send(new GetMessageHistoryQuery(GetUserId(), receiverId, paginatedRequest));

            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        }
    }
}
