using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class Course
    {
        public string Id { get; set; }
        public string Title { get; set; } = "";
        public string ProviderId { get; set; }
        public string Description { get; set; } = "";
        public string Currency { get; set; } = "usd";
        public string CourseProfileImageUrl { get; set; }
        public int LessonCount {  get; set; }
        public int SectionCount {  get; set; }
        public decimal Price { get; set; }
        public string CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public Provider Provider { get; set; }
        public ICollection<Sections> Sections { get; set; } = new List<Sections>();
        public ICollection<WishlistItem>? WishlistItems { get; set; } = new List<WishlistItem>();
        public ICollection<OrderItem>? OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<UserCourseRating> UserCourseRating { get; set; } = new List<UserCourseRating>();

        //public ICollection<Student>?Students { get; set; } = new List<Student>();
        public ICollection<CourseStudent> CourseStudent { get; set; } = new List<CourseStudent>();
    }
}
