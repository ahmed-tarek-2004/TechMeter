using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
    public class NotificationController(IMediator mediator) : ControllerBase
    {

        [HttpGet("all")]
        public async Task<ActionResult<Response<PaginatedList<NotificationResponseDto>>>> GetUserNotifications([FromQuery] PaginatedRequest request)
        {

            var response = await mediator.Send(new GetUserNotificationQuery(GetUserId(), request.PageNumber, request.PageSize));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("unread")]
        public async Task<ActionResult<Response<PaginatedList<NotificationResponseDto>>>> GetUserUnReadNotifications([FromQuery] PaginatedRequest request)
        {

            var response = await mediator.Send(new GetUserUnReadNotificationQuery(GetUserId(), request.PageNumber, request.PageSize));
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("TogglePolicy")]
        [HttpPost("{Id}/read")]
        public async Task<ActionResult<Response<bool>>> ReadNotification([FromRoute] string Id)
        {
            var response = await mediator.Send(new ReadNotificationCommand(GetUserId(), Id));
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("TogglePolicy")]
        [HttpPost("read/all")]
        public async Task<ActionResult<Response<bool>>> ReadAllNotifications()
        {
            var response = await mediator.Send(new ReadAllNotificationsCommand(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("store/token")]
        public async Task<IActionResult> StoreTokenAsync([FromBody] FcmUserTokenRequest request)
        {
            var result = await mediator.Send(new StoreUserTokensCommand(GetUserId(), request.token));
            return StatusCode((int)result.StatusCode, result);
        }


        //[HttpPost("topic")]
        //public async Task<IActionResult> SendToTopic(
        //    NotificationRequest request)
        //{
        //    var result =
        //        await fcmService.SendToTopicAsync(
        //            request.Topic!,
        //            request.Title,
        //            request.Body);

        //    return Ok(result);
        //}



        //[HttpPost("condition")]
        //public async Task<IActionResult> SendToCondition(
        //    NotificationRequest request)
        //{
        //    var result =
        //        await fcmService.SendConditionAsync(
        //            request.Condition!,
        //            request.Title,
        //            request.Body);

        //    return Ok(result);
        //}


        //[HttpPost("subscribe")]
        //public async Task<IActionResult> Subscribe(
        //    List<string> tokens,
        //    [FromQuery] string topic)
        //{
        //    await fcmService
        //        .SubscribeToTopicAsync(tokens, topic);

        //    return Ok();
        //}

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
