using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Cart
{
    public class CartResponse
    {
        public string CartId { get; set; }
        public int TotalItems { get; set; }
        public decimal TotalPrice { get; set; }
        public List<CartItemResponse> Items { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
