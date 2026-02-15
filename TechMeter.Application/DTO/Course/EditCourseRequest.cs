using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Course
{
    public class EditCourseRequest
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public IFormFile? CourseProfileImageUrl { get; set; }
        public string CategoryId {  get; set; }
    }
}
