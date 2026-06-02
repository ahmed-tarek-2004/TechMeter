using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.AddCourse
{
    public class AddCourseCommandHandler(ICourseService courseService) : IRequestHandler<AddCourseCommand, Response<AddCourseResponse>>
    {
        public async Task<Response<AddCourseResponse>> Handle(AddCourseCommand request, CancellationToken cancellationToken)
        {
            return await courseService.AddCourseAsync(request.providerId, request.addCourseRequest);
        }
    }
}
