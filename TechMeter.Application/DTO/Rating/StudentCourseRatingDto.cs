using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Rating
{
    public class StudentCourseRatingDto
    {
        public string StudentId { get; set; }
        public string CourseId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
