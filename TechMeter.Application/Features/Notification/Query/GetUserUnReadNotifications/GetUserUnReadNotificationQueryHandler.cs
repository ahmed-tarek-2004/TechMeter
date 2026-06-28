using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Features.Notification.Query.GetUserNotifications;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Query.GetUserUnReadNotifications
{
    public class GetUserUnReadNotificationQueryHandler(INotificationService notificationService)
        : IRequestHandler<GetUserNotificationQuery, Response<List<NotificationResponseDto>>>
    {
        public async Task<Response<List<NotificationResponseDto>>> Handle(GetUserNotificationQuery request, CancellationToken cancellationToken)
        {
            return await notificationService.GetUnReadUserNotifications(request.userId);
        }
    }
}
