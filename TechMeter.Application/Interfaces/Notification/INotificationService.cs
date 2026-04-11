using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
//using TechMeter.Application.Hubs;

namespace TechMeter.Application.Interfaces.Notification
{
    public interface INotificationService
    {
        Task EnrollmantNotification(string userId, string Titile, string Message, DateTime dateTime);

    }
}
