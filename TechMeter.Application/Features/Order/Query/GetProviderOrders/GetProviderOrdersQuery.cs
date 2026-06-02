using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetProviderOrders
{
    public class GetProviderOrdersQuery:IRequest<Response<PaginatedList<OrderSummaryResponse>>>
    {
        public string ProviderId { get; set; }
        public GetOrders GetOrders { get; set; }
    }
}
