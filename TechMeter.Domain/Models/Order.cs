using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class Order
    {
        public string Id { get; set; }
       
        public decimal Commission { get; set; }
        public OrderStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        //public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        public string StudentId { get; set; }
        public string OrderItemId { get; set; }
        public Student Student { get; set; }
        public OrderItem Item { get; set; }
        //public Transaction Transaction { get; set; }
    }
}
