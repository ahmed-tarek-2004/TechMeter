using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetAdminOrders
{
    public class GetAdminOrdersQuery : IRequest<Response<PaginatedList<OrderSummaryResponse>>>
    {
        public GetOrders GetOrders { get; set; }
    }
}
