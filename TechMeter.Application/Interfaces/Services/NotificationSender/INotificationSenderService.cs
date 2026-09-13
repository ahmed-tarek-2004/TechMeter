using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
//using TechMeter.Application.Hubs;

namespace TechMeter.Application.Interfaces.Services.NotificationSender
{
    public interface INotificationSenderService
    {
        Task SendNotificationAsync(string userId, string Titile, string Message, DateTime dateTime, string? fullName = null, string? userName = null);
        //Task SendNotificationToUsersAsync(List<string> usersId, string Titile, string Message, DateTime dateTime, string? fullName = null, string? userName = null);
    }
}
