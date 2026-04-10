using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.EditCourse
{
    public class EditCourseCommand : IRequest<Response<string>>
    {
        public string courseId { get; set; }
        public string providerId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public IFormFile? CourseProfileImageUrl { get; set; }
        public string CategoryId { get; set; }
        public string Currency { get; set; }
        public decimal Price { get; set; }
    }
}
