using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Models
{
    public class OrderItem
    {
        public string Id { get; set; }
        public string OrderId { get; set; }
        public Order Order { get; set; }
        public string CourseId { get; set; }
        public Course Course { get; set; }
        public decimal UnitPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
