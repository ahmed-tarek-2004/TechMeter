using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.ReadNotification
{
    public class ReadNotificationCommandHandler(INotificationService notificationService)
        : IRequestHandler<ReadNotificationCommand, Response<bool>>
    {
        public async Task<Response<bool>> Handle(ReadNotificationCommand request, CancellationToken cancellationToken)
        {
            return await notificationService.ReadNotification(request.userId, request.notificationId);
        }
    }
}
