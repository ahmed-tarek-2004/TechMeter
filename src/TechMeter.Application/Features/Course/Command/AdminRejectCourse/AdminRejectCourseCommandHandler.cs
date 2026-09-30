using MediatR;
using Microsoft.AspNetCore.Components.Forms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Events.Course.AdminTriggeredCourseEvent;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.AdminRejectCourse
{
    public class AdminRejectCourseCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler, IMediator mediator) : IRequestHandler<AdminRejectCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AdminRejectCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await context.Course.FindAsync(request.courseId, cancellationToken);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course is not found");
            }

            if (course.State == Domain.Enums.CourseState.Rejected)
            {
                return responseHandler.BadRequest<string>("Course is Already Rejected");
            }
            if (course.State == Domain.Enums.CourseState.Archived)
            {
                return responseHandler.BadRequest<string>("Course is Archieved now , can not publish right now");
            }
            course.State = Domain.Enums.CourseState.Rejected;
            await context.SaveChangesAsync(cancellationToken);


            await mediator.Publish(new AdminTriggeredCourseEvent(course.ProviderId, course.Title, course.State));

            return responseHandler.Success(string.Empty, "Course Published Successfully");
        }
    }
}
