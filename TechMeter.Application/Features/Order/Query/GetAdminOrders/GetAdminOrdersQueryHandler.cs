using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetAdminOrders
{
    public class GetAdminOrdersQueryHandler(IOrderService orderService) : IRequestHandler<GetAdminOrdersQuery, Response<PaginatedList<OrderSummaryResponse>>>
    {
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
        {
            return await orderService.GetAdminOrders(request.GetOrders);
        }
    }
}
