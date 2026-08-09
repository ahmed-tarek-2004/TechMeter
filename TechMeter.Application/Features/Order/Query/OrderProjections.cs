using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;

namespace TechMeter.Application.Features.Order.Query
{
    public static class OrderProjections
    {
        public static Expression<Func<Domain.Models.Order, OrderResponse>> ToResponse()
        {
            return order => new OrderResponse
            {
                Id = order.Id,
                StudentId = order.StudentId,
                CreatedAt = order.CreatedAt,
                Status = order.Status,
                TotalPrice = order.TotalPrice,

                OrderItems = order.OrderItems
                    .Select(oi => new OrderItemResponse
                    {
                        Id = oi.Id,
                        CourseId = oi.CourseId,
                        CourseName = oi.Course.Title
                    })
                    .ToList()
            };
        }
    }
}
