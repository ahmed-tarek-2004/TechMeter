using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetProviderOrders
{
    public class GetProviderOrdersQueryHandler(IOrderService orderService) : IRequestHandler<GetProviderOrdersQuery, Response<PaginatedList<OrderSummaryResponse>>>
    {
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> Handle(GetProviderOrdersQuery request, CancellationToken cancellationToken)
        {
            return await orderService.GetProviderOrders(request.ProviderId, request.GetOrders);
        }
    }
}
