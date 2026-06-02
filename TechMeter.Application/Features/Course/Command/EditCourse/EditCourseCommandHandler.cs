using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.EditCourse
{
    public class EditCourseCommandHandler(ICourseService courseService) : IRequestHandler<EditCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditCourseCommand request, CancellationToken cancellationToken)
        {
            return await courseService.EditCourseAsync(request.courseId, request.providerId, request.editCourseRequest);
        }
    }
}
