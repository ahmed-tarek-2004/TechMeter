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

        public async Task SendNotificationAsync(string userId, string Titile, string Message, DateTime dateTime, string? fullName = null, string? userName = null)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("UserId is Null");
                return;
            }

            await _hubContext.Clients.User(userId).SendAsync("ReciveNotificationFromUser", new
            {
                UserId = userId,
                Titile = Titile,
                Title = Titile,
                Message = Message,
                CreatedAt = dateTime,
                FullName = fullName,
                UserFullName = fullName,
                UserName = userName,
            });
            //await _hubContext.Clients.All.SendAsync("enrollment", Titile, Message);
            _logger.LogInformation("notification is sent");
        }
        //public async Task SendNotificationToUsersAsync(List<string> usersId, string Titile, string Message, DateTime dateTime, string? fullName = null, string? userName = null)
        //{
        //    if (usersId == null || usersId.Count == 0)
        //    {
        //        _logger.LogWarning("UsersId is Null or Empty");
        //        return;
        //    }

        //    await _hubContext.Clients.Users(usersId).SendAsync("ReciveNotificationFromUsers", new
        //    {
        //        Titile = Titile,
        //        Title = Titile,
        //        Message = Message,
        //        CreatedAt = dateTime,
        //        FullName = fullName,
        //        UserFullName = fullName,
        //        UserName = userName,
        //    });
        //    //await _hubContext.Clients.All.SendAsync("enrollment", Titile, Message);
        //    _logger.LogInformation("notification is sent");
        //}


    }
}
