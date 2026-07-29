using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.DeleteCourse
{
    public class DeleteCourseCommandHandler(ICourseService courseService) : IRequestHandler<DeleteCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
        {
            return await courseService.DeleteCourseByIdAsync(request.responsibleId, request.courseId);
        }
    }
}
