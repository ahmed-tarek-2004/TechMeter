using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.StoreNotification
{
    public sealed record StoreNotificationCommand(string userId, string token) : IRequest<Response<bool>>;
}
