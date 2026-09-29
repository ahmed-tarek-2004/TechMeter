using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Events.Course.ProviderAddedCourse;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.ProviderPublishCourse
{
    public class ProviderSubmitCourseCommandHanlder(IApplicationDbContext context, ResponseHandler responseHandler, IMediator mediator) :
        IRequestHandler<ProviderSubmitCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ProviderSubmitCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await context.Course.FirstOrDefaultAsync(b => b.Id == request.CourseId && b.ProviderId == request.ProviderId, cancellationToken);
            if (course == null)
            {
                return responseHandler.NotFound<string>("course not found for this provider");
            }
            if (course.State == CourseState.Published)
            {
                return responseHandler.BadRequest<string>("course is already Published");
            }
            if (course.State == CourseState.PendingReview)
            {
                return responseHandler.BadRequest<string>("course is already under Review");
            }
            var hasLessons = await context.Lessons.AnyAsync(l => l.section.CourseId == request.CourseId, cancellationToken);
            if (!hasLessons)
            {
                return responseHandler.BadRequest<string>("course must has a lessons to publish");
            }
            course.State = Domain.Enums.CourseState.PendingReview;
            await context.SaveChangesAsync(cancellationToken);
            await mediator.Publish(new CourseSubmittedForReviewEvent(request.ProviderId));
            return responseHandler.Success(string.Empty, "coursed is now under review");
        }
    }
}
