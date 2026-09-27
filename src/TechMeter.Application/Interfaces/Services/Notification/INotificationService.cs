using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Services.Notification
{
    public interface INotificationService
    {
        Task<Response<string>> SendUserNotifications(string userId,string Title,string message,NotificationType type);
    }
}
