using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController(INotificationService notificationService) : ControllerBase
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
        [HttpPost("{notificationId}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<bool>>> ReadNotification([FromRoute] string notificationId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var response = await notificationService.ReadNotification(userId ?? "", notificationId);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
