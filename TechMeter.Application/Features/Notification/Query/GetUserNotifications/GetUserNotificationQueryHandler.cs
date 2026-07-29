using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Query.GetUserNotifications
{
    public class GetUserNotificationQueryHandler(INotificationService notificationService)
        : IRequestHandler<GetUserNotificationQuery, Response<List<NotificationResponseDto>>>
    {
        public async Task<Response<List<NotificationResponseDto>>> Handle(GetUserNotificationQuery request, CancellationToken cancellationToken)
        {
            return await notificationService.GetUserNotifications(request.userId);
        }
    }
}
