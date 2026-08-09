using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetStudentOrders
{
    public class GetStudentOrdersQueryHandler(IApplicationDbContext context, ILogger<GetStudentOrdersQueryHandler> logger,
        ResponseHandler responseHandler) : IRequestHandler<GetStudentOrdersQuery, Response<PaginatedList<OrderSummaryResponse>>>
    {
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> Handle(GetStudentOrdersQuery request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FirstOrDefaultAsync(b => b.Id == request.StudentId);
            if (Student == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<PaginatedList<OrderSummaryResponse>>("User Not Found , Login/Register To Continue");
            }
            //
            var name = await context.Users.Where(b => b.Id == request.StudentId).Select(b => b.UserName).FirstOrDefaultAsync();
            var orders = context.Order
                   .Where(o => o.StudentId == Student.Id)
                   .Select(o => new OrderSummaryResponse
                   {
                       Id = o.Id,
                       StudentId = request.StudentId,
                       CreatedAt = o.CreatedAt,
                       Status = o.Status,
                       //StudentName = name,
                       //StudentName = name.UserName,
                       Total = o.TotalPrice
                   });

            var paginaredList = await PaginatedList<OrderSummaryResponse>.CreatePaginatedList(orders, request.GetOrders.PageNumber, request.GetOrders.PageSize);


            return responseHandler.Success(paginaredList, "Order returned Successfully");
        }
    }
}
