using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Lesson
{
    public class AddLessonRequest
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public IFormFile LessonStream { get; set; }
    }
}
