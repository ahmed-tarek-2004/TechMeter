using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TechMeter.Application.DTO;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Interfaces.Fcm;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Services.Notification;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController(INotificationService notificationService, IFcmService fcmService) : ControllerBase
    {

        [HttpGet("all")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<List<NotificationResponseDto>>>> GetUserNotifications()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;

            var response = await notificationService.GetUserNotifications(userId);
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("toggle")]
        [HttpPost("read/{notificationId}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<bool>>> ReadNotification([FromRoute] string notificationId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var response = await notificationService.ReadNotification(userId ?? "", notificationId);
            return StatusCode((int)response.StatusCode, response);
        }
        //[HttpPost("token")]
        //public async Task<IActionResult> SendToToken(
        //NotificationRequest request)
        //{
        //    var result =
        //        await fcmService.SendToTokenAsync(
        //            request.Token!,
        //            request.Title,
        //            request.Body);

        //    return Ok(result);
        //}


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
    }
}
