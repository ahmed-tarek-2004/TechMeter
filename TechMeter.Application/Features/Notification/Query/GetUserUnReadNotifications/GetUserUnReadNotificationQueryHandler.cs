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
        : IRequestHandler<GetUserUnReadNotificationQuery, Response<PaginatedList<NotificationResponseDto>>>
    {
        public async Task<Response<PaginatedList<NotificationResponseDto>>> Handle(GetUserUnReadNotificationQuery request, CancellationToken cancellationToken)
        {
            var notifications = context.Notification
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
                });
            var response = await PaginatedList<NotificationResponseDto>.CreatePaginatedList(notifications, request.pageNumber, request.pageSize, cancellationToken);

            return responseHandler.Success(response, "user notification returned successfully");
        }
    }
}
