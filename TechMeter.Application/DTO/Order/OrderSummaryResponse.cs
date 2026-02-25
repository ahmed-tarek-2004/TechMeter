using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.DTO.Order
{
    public class OrderSummaryResponse
    {
        public string Id { get; set; }
        public OrderStatus Status { get; set; }
        public string StudentName { get; set; }
        public string StudentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Total { get; set; }

    }
}
