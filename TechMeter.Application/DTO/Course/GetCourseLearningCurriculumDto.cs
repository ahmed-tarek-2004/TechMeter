using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;

namespace TechMeter.Application.DTO.Course
{
    public class GetCourseLearningCurriculumDto
    {
        public string Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string CourseProfileImageUrl { get; set; }
        public string ProviderId { get; set; }
        public int LessonCount { get; set; }
        public int SectionCount { get; set; }
        public decimal Progress { get; set; }
        public DateTime LastAccess { get; set; }
        public List<GetLearningSectionDto> Sections { get; set; }

    }
}
