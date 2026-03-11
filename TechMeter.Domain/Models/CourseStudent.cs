using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class CourseStudent
    {
        public string StudentId { get; set; }
        public string CourseId { get; set; }
        public DateTime EnrolmentDate { get; set; }
        public DateTime LastAccess { get; set; } 
        public Student Student { get; set; }
        public Course Course { get; set; }
    }
}
