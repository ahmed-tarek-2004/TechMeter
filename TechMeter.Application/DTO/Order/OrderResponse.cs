using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.DTO.Order
{
    public class OrderResponse
    {
        public string Id { get; set; }
        public string StudentId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.PendingPayment;
        public decimal TotalPrice { get; set; }
        public string ShippingAddress { get; set; }
        public List<OrderItemResponse> OrderItems { get; set; }
    }
}
