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
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Application.Events.Course.ProviderAddedCourse
{
    public class CourseSubmittedForReviewEventHandler(IBackgroundJobService backgroundJobService,
        UserManager<User> userManager) : INotificationHandler<CourseSubmittedForReviewEvent>
    {
        public async Task Handle(CourseSubmittedForReviewEvent notification, CancellationToken cancellationToken)
        {
            var admins = await userManager.GetUsersInRoleAsync("admin");
            if (admins is null || !admins.Any())
                return;
            var admin = admins.FirstOrDefault();
            var provider = await userManager.FindByIdAsync(notification.ProviderId);
            var title = "A new Course Under Review";
            var body = $"Provider {provider.FullName} has finished uploading a new course and submitted it for review. The course is now waiting for your approval or rejection.\r\n\r\nPlease review the course and take the approp";

            backgroundJobService.Enqueue<IFcmService>(b => b.SendToTokensAsync(admin.Id, title, body));
            backgroundJobService.Enqueue<INotificationService>(b => b.SendUserNotifications(admin.Id, title, body, Domain.Enums.NotificationType.Assignment));
            backgroundJobService.Enqueue<IEmailService>(b => b.SendPublicEmailMessageAsync(admin.FullName, admin.Email, provider.FullName,title, body, cancellationToken));
        }
    }
}
