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
        public ICollection<Order> Orders { get; set; } = new List<Order>(); 
        public ICollection<Course> Courses { get; set; } = new List<Course>();
        public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
        public ICollection<UserCourseRating> UserCourseRating { get; set; } = new List<UserCourseRating>(); 
    }
}
