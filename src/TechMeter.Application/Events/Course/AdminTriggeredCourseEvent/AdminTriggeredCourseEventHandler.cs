using Hangfire;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Email;
using TechMeter.Application.Interfaces.Services.Fcm;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Application.Events.Course.AdminTriggeredCourseEvent
{
    public class AdminTriggeredCourseEventHandler(IBackgroundJobService backgroundJobService,
        UserManager<User> userManager) : INotificationHandler<AdminTriggeredCourseEvent>
    {
        public async Task Handle(AdminTriggeredCourseEvent notification, CancellationToken cancellationToken)
        {
            var provider = await userManager.FindByIdAsync(notification.ProviderId);

            string title = string.Empty, content = string.Empty;
            if (notification.State == Domain.Enums.CourseState.Published)
            {
                title = "Your Course Has Been Published";
                content = $"Congratulations! Your course \"{notification.courseTitle}\" has been published successfully and is now available to students.";
            }

            if (notification.State == Domain.Enums.CourseState.Rejected)
            {
                title = "Your Course Has Been Rejected";
                content = $"Sorry! Your course \"{notification.courseTitle}\" has been Rejected Duo To Some Policies.";
            }

            backgroundJobService.Enqueue<IFcmService>(b => b.SendToTokensAsync(provider.Id, title, content));
            backgroundJobService.Enqueue<INotificationService>(b => b.SendUserNotifications(provider.Id, title, content, Domain.Enums.NotificationType.Assignment));
            backgroundJobService.Enqueue<IEmailService>(b => b.SendPublicEmailMessageAsync(provider.FullName, provider.Email, "TechMeter Support", title, content, cancellationToken));
        }
    }
}
