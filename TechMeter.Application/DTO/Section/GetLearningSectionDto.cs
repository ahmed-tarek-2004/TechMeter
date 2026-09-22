using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;

namespace TechMeter.Application.DTO.Section
{
    public class GetLearningSectionDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string courseId { get; set; }
        public int LessonCount { get; set; }
        public List<GetLessonResponse> Lessons { get; set; }
    }
}
