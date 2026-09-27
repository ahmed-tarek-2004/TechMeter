using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Messeage;
using TechMeter.Application.Features.Message.Query;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Messages")]
    [Produces("application/json")]
    public class MessageController(IMediator mediator) : ControllerBase
    {
        [HttpGet("{receiverId}")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Get message history with a user",
            Description = "Requires JWT Bearer authentication. Returns a paginated list of messages exchanged between the authenticated user and the specified receiver.",
            OperationId = "Message_GetHistory",
            Tags = new[] { "Messages" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Message history retrieved successfully", typeof(Response<PaginatedList<MessageHistoryResponse>>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Receiver not found")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<MessageHistoryResponse>>>> ReturnHistoryMessagesAsync
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
