using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models.Auth.Users
{
    public class Student
    {
        public string Id { get; set; }
        public DateTime? BirthDate { get; set; }
        public string EducationLevel { get; set; }
        public User User { get; set; }
        public Cart Cart { get; set; }
        public Wishlist? Wishlist { get; set; }
        public List<Order> Orders { get; set; } = new List<Order>(); 
    }
}
