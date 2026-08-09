using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetAdminOrders
{
    public class GetAdminOrdersQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetAdminOrdersQuery, Response<PaginatedList<OrderSummaryResponse>>>
    {
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = context.Order.Select(o => new OrderSummaryResponse()
            {
                Id = o.Id,
                StudentId = o.StudentId,
                CreatedAt = o.CreatedAt,
                //StudentName = o.Student.FullName,
                Status = o.Status,
                Total = o.TotalPrice
            });
            var response = await PaginatedList<OrderSummaryResponse>.CreatePaginatedList(orders, request.GetOrders.PageNumber, request.GetOrders.PageSize);
            return responseHandler.Success(response, "Order Returned Successfully for Admin");
        }
    }
}
