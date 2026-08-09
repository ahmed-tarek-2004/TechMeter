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
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetOrderById
{
    public class GetOrderByIdQueryHandler(IApplicationDbContext context, ILogger<GetOrderByIdQueryHandler> logger,
        ResponseHandler responseHandler) : IRequestHandler<GetOrderByIdQuery, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(b => b.Id == request.userId);
            if (user == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<OrderResponse>("User Not Found , Login/Register To Continue");
            }

            var order = await context.Order
                .Include(c => c.OrderItems)
                .ThenInclude(b => b.Course)
                .FirstOrDefaultAsync(b => b.Id == request.orderId);


            if (order == null || !order.OrderItems.Any() || order.OrderItems == null)
            {
                logger.LogWarning("There is no Courses in Your Order");
                return responseHandler.BadRequest<OrderResponse>("Order Is Empty");
            }

            var response = new OrderResponse()
            {
                Id = order.Id,
                StudentId = request.userId,
                CreatedAt = order.CreatedAt,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                OrderItems = order.OrderItems.Select(b => new OrderItemResponse()
                {
                    Id = b.Id,
                    CourseId = b.CourseId,
                    CourseName = b.Course.Title,

                }).ToList()
            };
            return responseHandler.Success(response, "Order returned Successfully");

        }
    }
}
