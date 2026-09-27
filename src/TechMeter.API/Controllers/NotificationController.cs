using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Features.Notification.Command.ReadAllNotification;
using TechMeter.Application.Features.Notification.Command.ReadNotification;
using TechMeter.Application.Features.Notification.Command.StoreNotification;
using TechMeter.Application.Features.Notification.Query.GetUserNotifications;
using TechMeter.Application.Features.Notification.Query.GetUserUnReadNotifications;
//using TechMeter.Application.Interfaces.Notification;
using TechMeter.Application.Interfaces.Services.Fcm;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    [Tags("Notifications")]
    [Produces("application/json")]
    public class NotificationController(IMediator mediator) : ControllerBase
    {

        [HttpGet("all")]
        [SwaggerOperation(
            Summary = "Get all user notifications",
            Description = "Requires JWT Bearer authentication. Returns a paginated list of all notifications (read and unread) for the authenticated user.",
            OperationId = "Notification_GetAll",
            Tags = new[] { "Notifications" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Notifications retrieved successfully", typeof(Response<PaginatedList<NotificationResponseDto>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<NotificationResponseDto>>>> GetUserNotifications([FromQuery] PaginatedRequest request)
        {
            var response = await mediator.Send(new GetUserNotificationQuery(GetUserId(), request.PageNumber, request.PageSize));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("unread")]
        [SwaggerOperation(
            Summary = "Get unread notifications",
            Description = "Requires JWT Bearer authentication. Returns a paginated list of unread notifications for the authenticated user.",
            OperationId = "Notification_GetUnread",
            Tags = new[] { "Notifications" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Unread notifications retrieved successfully", typeof(Response<PaginatedList<NotificationResponseDto>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<NotificationResponseDto>>>> GetUserUnReadNotifications([FromQuery] PaginatedRequest request)
        {
            var response = await mediator.Send(new GetUserUnReadNotificationQuery(GetUserId(), request.PageNumber, request.PageSize));
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("TogglePolicy")]
        [HttpPost("{Id}/read")]
        [SwaggerOperation(
            Summary = "Mark notification as read",
            Description = "Requires JWT Bearer authentication. Marks a single notification as read for the authenticated user. Rate-limited by TogglePolicy.",
            OperationId = "Notification_ReadOne",
            Tags = new[] { "Notifications" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Notification marked as read", typeof(Response<bool>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Notification not found")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<bool>>> ReadNotification([FromRoute] string Id)
        {
            var response = await mediator.Send(new ReadNotificationCommand(GetUserId(), Id));
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("TogglePolicy")]
        [HttpPost("read/all")]
        [SwaggerOperation(
            Summary = "Mark all notifications as read",
            Description = "Requires JWT Bearer authentication. Marks all unread notifications as read for the authenticated user. Rate-limited by TogglePolicy.",
            OperationId = "Notification_ReadAll",
            Tags = new[] { "Notifications" })]
        [SwaggerResponse(StatusCodes.Status200OK, "All notifications marked as read", typeof(Response<bool>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<bool>>> ReadAllNotifications()
        {
            var response = await mediator.Send(new ReadAllNotificationsCommand(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("store/token")]
        [SwaggerOperation(
            Summary = "Store FCM device token",
            Description = "Requires JWT Bearer authentication. Registers a Firebase Cloud Messaging (FCM) device token to enable push notifications for the authenticated user.",
            OperationId = "Notification_StoreToken",
            Tags = new[] { "Notifications" })]
        [SwaggerResponse(StatusCodes.Status200OK, "FCM token stored successfully")]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Token is missing or invalid")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<IActionResult> StoreTokenAsync([FromBody] FcmUserTokenRequest request)
        {
            var result = await mediator.Send(new StoreUserTokensCommand(GetUserId(), request.token));
            return StatusCode((int)result.StatusCode, result);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
