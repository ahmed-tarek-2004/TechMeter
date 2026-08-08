using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Features.Notification.Query.GetUserNotifications;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Query.GetUserUnReadNotifications
{
    public class GetUserUnReadNotificationQueryHandler(IApplicationDbContext context,ResponseHandler responseHandler)
        : IRequestHandler<GetUserNotificationQuery, Response<List<NotificationResponseDto>>>
    {
        public async Task<Response<List<NotificationResponseDto>>> Handle(GetUserNotificationQuery request, CancellationToken cancellationToken)
        {
            var notifications = await context.Notification
                .AsNoTracking()
                .Where(n => n.ReceiptId == request.userId && n.IsRead == false)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    ReceiptId = n.ReceiptId
                }).ToListAsync();

            return responseHandler.Success(notifications, "user notification returned successfully");
        }
    }
}
