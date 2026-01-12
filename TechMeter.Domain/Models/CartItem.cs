using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class CartItem
    {
        public string Id { get; set; }
        public string CartId { get; set; }
        public Cart Cart { get; set; }
        public string CourseId { get; set; }
        public Course Course { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal UnitPrice { get; set; }= 0;

        //public string? OrderItemId { get; set; }
        //public OrderItem Item { get; set; }
    }
}
