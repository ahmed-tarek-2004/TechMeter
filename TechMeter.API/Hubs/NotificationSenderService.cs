using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Jobs;
using TechMeter.Application.Interfaces.NotificationSender;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Hubs
{
    public class NotificationSenderService : INotificationSenderService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationSenderService> _logger;
        public NotificationSenderService(IHubContext<NotificationHub> hubContext, ILogger<NotificationSenderService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task EnrollmantNotification(string userId, string Titile, string Message, DateTime dateTime)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("UserId is Null");
            }

            await _hubContext.Clients.User(userId).SendAsync("Enrollment", Titile, Message, dateTime, NotificationType.Enrollment);
            //await _hubContext.Clients.All.SendAsync("enrollment", Titile, Message);
            _logger.LogInformation("notification is sent");
        }
        public async Task FinishCourseNotification(string userId, string Titile, string Message, DateTime dateTime)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("UserId is Null");
            }
            await _hubContext.Clients.User(userId).SendAsync("Finish", Titile, Message, dateTime, NotificationType.FinishCourse);
        }
      
    }
}
