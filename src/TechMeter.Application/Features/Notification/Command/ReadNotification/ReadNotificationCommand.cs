using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.ReadNotification
{
    public sealed record ReadNotificationCommand(string userId, string notificationId) : IRequest<Response<bool>>;
}
