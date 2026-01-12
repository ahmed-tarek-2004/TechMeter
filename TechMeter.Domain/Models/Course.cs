using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Models
{
    public class Course
    {
        public string Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string CourseProfileImageUrl { get; set; }
        public string CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}
