using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
//using TechMeter.Application.Hubs;

namespace TechMeter.Application.Interfaces.NotificationSender
{
    public interface INotificationSenderService
    {
        Task SendNotificationAsync(string userId, string Titile, string Message, DateTime dateTime);
    }
}
