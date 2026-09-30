using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Events.Course.AdminTriggeredCourseEvent;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.AdminPublishCourse
{
    public class AdminPublishCourseCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler, IMediator mediator) :
        IRequestHandler<AdminPublishCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AdminPublishCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await context.Course.FindAsync(request.courseId, cancellationToken);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course is not found");
            }
            if (course.State == Domain.Enums.CourseState.Published)
            {
                return responseHandler.BadRequest<string>("Course is Already Published");
            }
            if (course.State == Domain.Enums.CourseState.Archived)
            {
                return responseHandler.BadRequest<string>("Course is Archieved now , can not publish right now");
            }
            course.State = Domain.Enums.CourseState.Published;
            await context.SaveChangesAsync(cancellationToken);


            await mediator.Publish(new AdminTriggeredCourseEvent(course.ProviderId, course.Title, course.State));

            return responseHandler.Success(string.Empty, "Course Published Successfully");
        }
    }
}
