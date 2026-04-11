//using Microsoft.AspNetCore.SignalR;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using TechMeter.Application.Interfaces.Jobs;
//using TechMeter.Domain.Models;
//using TechMeter.Domain.Models.Auth.Identity;

//namespace TechMeter.Infrastructure.Jobs
//{
//    public class EnrollmentNotificationJob:IEnrollmentNotificationJob
//    {
//        private readonly IHubContext<NotificationHub> _hubContext;
//        public EnrollmentNotificationJob(IHubContext<NotificationHub> hubContext)
//        {
//            _hubContext = hubContext;
//        }
//        public async Task SendNotification(string userId, string Title, string Message, DateTime CreatedAt)
//        {
//            await _hubContext.Clients.All.SendAsync("enrollment", Title, Message, CreatedAt);

//        }
//    }
//}
