using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Messeage;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Message.Query
{
    public class GetMessageHistoryQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) :
        IRequestHandler<GetMessageHistoryQuery, Response<PaginatedList<MessageHistoryResponse>>>
    {
        public async Task<Response<PaginatedList<MessageHistoryResponse>>> Handle(GetMessageHistoryQuery request, CancellationToken cancellationToken)
        {
            var receiverExists = await context.Users.AnyAsync(b => b.Id == request.receiverId);
            if (!receiverExists)
            {
                return responseHandler.NotFound<PaginatedList<MessageHistoryResponse>>("Receiver is not Found");
            }
            var message = context.UserMessages
                .AsNoTracking()
                .Where(b => (b.SenderId == request.userId && b.ReciptId == request.receiverId)
                ||(b.ReciptId == request.userId && b.SenderId == request.receiverId))
                .Select(b => new MessageHistoryResponse
                {
                    isRead = b.isRead,
                    Message = b.Content,
                    MessageId = b.Id,
                    ReciverId = b.ReciptId,
                    SenderId = b.SenderId,
                    SentAt = b.SentAt,
                });
            var response = await PaginatedList<MessageHistoryResponse>.CreatePaginatedList(message, request.PaginatedRequest.PageNumber,
                request.PaginatedRequest.PageSize, cancellationToken);

            return responseHandler.Success(response, "History Returned Successfully");
        }
    }
}
