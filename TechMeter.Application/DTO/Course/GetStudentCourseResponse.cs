using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Course
{
    public class GetStudentCourseResponse
    {
        public string Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string CourseProfileImageUrl { get; set; }
        public string CategoryId { get; set; }
        public string ProviderId { get; set; }
        public int LessonCount {  get; set; }
        public int SectionCount {  get; set; }
        public decimal Progress {  get; set; }
    }
}
