using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Messeage;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Message.Query
{
    public sealed record GetMessageHistoryQuery(string userId,string receiverId,PaginatedRequest PaginatedRequest)
        :IRequest<Response<PaginatedList<MessageHistoryResponse>>>;
}
