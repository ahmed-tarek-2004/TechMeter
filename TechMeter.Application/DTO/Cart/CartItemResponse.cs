using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Cart
{
    public class CartItemResponse
    {
        public string Id { get; set; }
        public string CourseId { get; set; }
        public decimal UnitPrice { get; set; } = 0;
        public string CourseName { get; set; }
        public string CourseImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
