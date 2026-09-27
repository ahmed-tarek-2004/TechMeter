using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.ReadAllNotification
{
    public class ReadAllNotificationsCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<ReadAllNotificationsCommand, Response<bool>>
    {
        public async Task<Response<bool>> Handle(ReadAllNotificationsCommand request, CancellationToken cancellationToken)
        {
            var userExists = await context.Users.AnyAsync(u => u.Id == request.userId, cancellationToken);
            if (!userExists)
            {
                return responseHandler.NotFound<bool>("User not found.");
            }
            var rows = await context.Notification
                .Where(n => n.ReceiptId == request.userId && !n.IsRead)
                .ExecuteUpdateAsync(b => b.SetProperty(b => b.IsRead, true), cancellationToken);

            return responseHandler.Success<bool>(true, "All notifications marked as read successfully.");
        }
    }
}
