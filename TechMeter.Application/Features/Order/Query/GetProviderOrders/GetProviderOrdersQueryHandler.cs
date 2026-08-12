using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetProviderOrders
{
    public class GetProviderOrdersQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetProviderOrdersQuery, Response<PaginatedList<OrderSummaryResponse>>>
    {
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> Handle(GetProviderOrdersQuery request, CancellationToken cancellationToken)
        {
            var Provider = await context.Provider.FirstOrDefaultAsync(b => b.Id == request.ProviderId);//check is verifed too in future
            if (Provider == null)
            {
                return responseHandler.NotFound<PaginatedList<OrderSummaryResponse>>("Provider is not Authorized");
            }


            var orders = context.Order.Where(o => o.OrderItems.Any(oi => oi.Course.ProviderId == request.ProviderId)).Select(o => new OrderSummaryResponse()
            {
                Id = o.Id,
                StudentId = o.StudentId,
                CreatedAt = o.CreatedAt,
                //StudentName = o.Student.,
                Status = o.Status,
                Total = o.TotalPrice,
            });


            var response = await PaginatedList<OrderSummaryResponse>.CreatePaginatedList(orders, request.GetOrders.PageNumber, request.GetOrders.PageSize);
            return responseHandler.Success(response, "Order Returned Successfully for Admin");

        }
    }
}
