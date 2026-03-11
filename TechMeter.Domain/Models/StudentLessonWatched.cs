using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class StudentLessonWatched
    {
        public string StudentId { get; set; }
        public string LessonId { get; set; }
        public DateTime WatchedDate { get; set; } = DateTime.UtcNow;
        public Student Student { get; set; }
        public Lessons Lessons { get; set; }
    }
}
