using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Query.GetUserNotifications
{
    public sealed record GetUserNotificationQuery(string userId) : IRequest<Response<List<NotificationResponseDto>>>;
}
