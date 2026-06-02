using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.EditCourse
{
    public class EditCourseCommand : IRequest<Response<string>>
    {
        public string courseId { get; set; }
        public string providerId { get; set; }
        public EditCourseRequest editCourseRequest { get; set; }
    }
}
