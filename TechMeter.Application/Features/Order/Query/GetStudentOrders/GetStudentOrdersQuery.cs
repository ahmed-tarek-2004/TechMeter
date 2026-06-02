using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetStudentOrders
{
    public class GetStudentOrdersQuery:IRequest<Response<PaginatedList<OrderSummaryResponse>>>
    {
        public string StudentId { get; set; }
        public GetOrders GetOrders { get; set; }
    }
}
