using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Notification
{
    public interface INotificationService
    {
        Task EnrollmantNotification(string userId, string Titile, string Message, DateTime dateTime);
        Task FinishCourseNotification(string userId, string Titile, string Message, DateTime dateTime);
        Task<Response<bool>> ReadNotification(string userId,string notificationId);
        Task<Response<List<NotificationResponseDto>>> GetUserNotification(string userId);
    }
}
