using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Notification
{
    public interface INotificationService
    {
        Task<Response<bool>> ReadNotification(string userId,string notificationId);
        Task<Response<List<NotificationResponseDto>>> GetUserNotifications(string userId);
        Task<Response<List<NotificationResponseDto>>> GetUnReadUserNotifications(string userId);
        Task<Response<string>> StoreUserNotifications(string userId,string Title,string message,NotificationType type);
        Task<Response<bool>> StoreUserTokensAsync(string userId, string token);
    }
}
