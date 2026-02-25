using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Order
{
    public class OrderItemResponse
    {
        public string Id { get; set; }
        public string CourseId { get; set; }
        public string CourseName { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}
