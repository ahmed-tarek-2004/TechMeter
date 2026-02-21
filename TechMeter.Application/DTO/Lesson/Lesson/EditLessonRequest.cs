using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Lesson.Lesson
{
    public class EditLessonRequest
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public string LessonUrl { get; set; }
        public string SectionId { get; set; }
    }
}
