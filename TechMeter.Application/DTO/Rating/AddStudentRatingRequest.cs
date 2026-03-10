using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Rating
{
    public class AddStudentRatingRequest
    {
        public string CourseId { get; set; }
        public int Rating { get; set; } = 0;
        public string? Comment { get; set; } = string.Empty;
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;
    }
}
