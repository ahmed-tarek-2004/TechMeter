using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Cart
{
    public class CartRequest
    {
        public string CourseId { get; set; }
        public decimal UnitPrice { get; set; } = 0;
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
