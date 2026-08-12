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
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.CreateOrder
{
    public class CreateOrderCommandHandler(IApplicationDbContext context, ILogger<CreateOrderCommandHandler> logger, 
        ResponseHandler responseHandler) : IRequestHandler<CreateOrderCommand, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FirstOrDefaultAsync(b => b.Id == request.StudentId);
            if (Student == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<OrderResponse>("User Not Found , Login/Register To Continue");
            }
            try
            {
                var cart = await context.Cart
                    .Include(c => c.CartItems)
                    .ThenInclude(b => b.Course)
                    .FirstOrDefaultAsync(b => b.StudentId == Student.Id);
                if (cart == null || !cart.CartItems.Any() || cart.CartItems == null)
                {
                    logger.LogWarning("Cart Is Empty.");
                    return responseHandler.BadRequest<OrderResponse>("Cart Is Empty.");
                }

                var order = new TechMeter.Domain.Models.Order()
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = request.StudentId,
                    CreatedAt = DateTime.UtcNow,
                    Status = TechMeter.Domain.Enums.OrderStatus.PendingPayment,
                    TotalPrice = cart.CartItems.Sum(b => b.UnitPrice),
                    UpdatedAt = DateTime.UtcNow,
                    PaymetnIntentId = request.PaymentIntentId,
                    OrderItems = new List<OrderItem>()
                };
                foreach (var item in cart.CartItems)
                {
                    //var Course = item.Course;

                    var orderItem = new OrderItem()
                    {
                        Id = Guid.NewGuid().ToString(),
                        OrderId = order.Id,
                        CourseId = item.CourseId,
                        Course = item.Course,
                    };
                    order.OrderItems.Add(orderItem);
                }
                await context.Order.AddAsync(order);
                context.CartItem.RemoveRange(cart.CartItems);
                cart.UpdatedAt = DateTime.UtcNow;
                context.Cart.Update(cart);
                await context.SaveChangesAsync(cancellationToken);
                var response = new OrderResponse()
                {
                    Id = order.Id,
                    StudentId = request.StudentId,
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
                return responseHandler.Success(response, "Order Created Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<OrderResponse>("Internal Server Error");
            }
        }
    }
}
