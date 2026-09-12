using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Notification;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Query.GetUserNotifications
{
    public class GetUserNotificationQueryHandler(IApplicationDbContext context,ResponseHandler responseHandler)
        : IRequestHandler<GetUserNotificationQuery, Response<PaginatedList<NotificationResponseDto>>>
    {
        public async Task<Response<PaginatedList<NotificationResponseDto>>> Handle(GetUserNotificationQuery request, CancellationToken cancellationToken)
        {
            var notifications = context.Notification
               .AsNoTracking()
               .Where(n => n.ReceiptId == request.userId)
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
