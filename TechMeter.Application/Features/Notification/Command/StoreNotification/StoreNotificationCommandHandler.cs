using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.StoreNotification
{
    public class StoreNotificationCommandHandler(INotificationService notificationService) : IRequestHandler<StoreNotificationCommand, Response<bool>>
    {
        public async Task<Response<bool>> Handle(StoreNotificationCommand request, CancellationToken cancellationToken)
        {
            return await notificationService.StoreUserTokensAsync(request.userId, request.token);
        }
    }
}
