using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using TechMeter.API.Hubs;
using TechMeter.Application.Common;
//using TechMeter.Application.Interfaces.Jobs;
using TechMeter.Application.Interfaces.Services.NotificationSender;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Services
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

        public async Task SendNotificationAsync(string userId, string Titile, string Message, DateTime dateTime)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("UserId is Null");
                return;
            }

            await _hubContext.Clients.User(userId).SendAsync("ReciveNotification", new
            {
                UserId = userId,
                Titile = Titile,
                Message = Message,
                CreatedAt = dateTime,
            });
            //await _hubContext.Clients.All.SendAsync("enrollment", Titile, Message);
            _logger.LogInformation("notification is sent");
        }


    }
}
