using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.AddCourse
{
    public class AddCourseCommand:IRequest<Response<AddCourseResponse>>
    {
        public string providerId {  get; set; }
        public AddCourseRequest addCourseRequest { get; set; }
    }
}
