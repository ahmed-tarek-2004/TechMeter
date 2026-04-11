//using Microsoft.AspNetCore.SignalR;
//using Microsoft.Extensions.Logging;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using TechMeter.API.;
//using TechMeter.Application.Interfaces.Notification;

//namespace TechMeter.Infrastructure.Services.Notification
//{
//    public class NotificationService : INotificationService
//    {
//        private readonly IHubContext<NotificationHub> _hubContext;
//        private readonly ILogger<NotificationService> _logger;
//        public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger)
//        {
//            _hubContext = hubContext;
//            _logger = logger;
//        }

//        public async Task EnrollmantNotification(string userId, string Titile, string Message, DateTime dateTime)
//        {
//            if (string.IsNullOrEmpty(userId))
//            {
//                _logger.LogWarning("UserId is Null");
//            }
//          //  await _hubContext.Clients.Group(userId).SendAsync("enrollment", Titile, Message, dateTime);
//            await _hubContext.Clients.All.SendAsync("enrollment", Titile, Message);
//            _logger.LogInformation("notification is sent");
//        }
//    }
//}
