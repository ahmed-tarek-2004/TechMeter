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
            var notifications = (from n in context.Notification
                                 join u in context.Users on n.ReceiptId equals u.Id into userGroup
                                 from u in userGroup.DefaultIfEmpty()
                                 where n.ReceiptId == request.userId && n.IsRead == false
                                 orderby n.CreatedAt descending
                                 select new NotificationResponseDto
                                 {
                                     Id = n.Id,
                                     Title = n.Title,
                                     Message = n.Message,
                                     CreatedAt = n.CreatedAt,
                                     IsRead = n.IsRead,
                                     ReceiptId = n.ReceiptId,
                                     FullName = u != null ? u.FullName : null,
                                     UserFullName = u != null ? u.FullName : null,
                                     UserName = u != null ? u.UserName : null,
                                 });
            var response = await PaginatedList<NotificationResponseDto>.CreatePaginatedList(notifications, request.pageNumber, request.pageSize, cancellationToken);

            return responseHandler.Success(response, "user notification returned successfully");
        }
    }
}
