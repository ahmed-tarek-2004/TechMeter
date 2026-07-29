using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Services.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetStudentOrders
{
    public class GetStudentOrdersQueryHandler(IOrderService orderService) : IRequestHandler<GetStudentOrdersQuery, Response<PaginatedList<OrderSummaryResponse>>>
    {
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> Handle(GetStudentOrdersQuery request, CancellationToken cancellationToken)
        {
            return await orderService.GetStudentOrders(request.StudentId, request.GetOrders);
        }
    }
}
