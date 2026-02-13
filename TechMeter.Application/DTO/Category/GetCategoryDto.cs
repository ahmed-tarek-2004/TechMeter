using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;

namespace TechMeter.Application.DTO.Category
{
    public class GetCategoryDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public List<GetCourseResponse>?courses { get; set; }
    }
}
