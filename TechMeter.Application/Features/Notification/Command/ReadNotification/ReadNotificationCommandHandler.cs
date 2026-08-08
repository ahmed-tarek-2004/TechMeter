using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.ReadNotification
{
    public class ReadNotificationCommandHandler(IApplicationDbContext context , ResponseHandler responseHandler)
        : IRequestHandler<ReadNotificationCommand, Response<bool>>
    {
        public async Task<Response<bool>> Handle(ReadNotificationCommand request, CancellationToken cancellationToken)
        {
            var rows = await context.Notification
                 .Where(n => n.ReceiptId == request.userId && n.Id == request.notificationId && !n.IsRead)
                 .ExecuteUpdateAsync(b => b.SetProperty(b => b.IsRead, true));
            if (rows == 0)
            {
                return responseHandler.Success(false, "notification not found or already read");
            }
            return responseHandler.Success(true, "notification marked as read successfully");
        }
    }
}
