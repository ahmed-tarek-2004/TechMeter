using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;

namespace TechMeter.Application.DTO.Course
{
    public class GetCourseResponse
    {
        public string Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string CourseProfileImageUrl { get; set; }
        public string CategoryId { get; set; }
        public string ProviderId {  get; set; }
        public string Currency { get; set; }
        public decimal Price { get; set; }
    }
}
