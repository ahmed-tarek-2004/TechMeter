using MediatR;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Events.Course.ProviderAddedCourse;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.ProviderArcieveCourse
{
    public class ProviderArcieveCourseCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<ProviderArcieveCourseCommandHandler> logger,
        ITransactionManager Transaction)
        : IRequestHandler<ProviderArcieveCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ProviderArcieveCourseCommand request, CancellationToken cancellationToken)
        {
            var transaction = await Transaction.BeginTransactionAsync(cancellationToken: cancellationToken);
            try
            {

                var course = await context.Course.FirstOrDefaultAsync(b => b.Id == request.CourseId && b.ProviderId == request.ProviderId, cancellationToken);
                if (course == null)
                {
                    return responseHandler.NotFound<string>("course not found for this provider");
                }
                if (course.State == CourseState.Archived)
                {
                    return responseHandler.BadRequest<string>("course is already Archieved");
                }
                await context.CartItem.Where(b => b.CourseId == request.CourseId)
                        .ExecuteDeleteAsync();
                course.State = Domain.Enums.CourseState.Archived;
                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "coursed is now Archived");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                logger.LogError(ex.Message, ex);
                return responseHandler.InternalServerError<string>("Internal Server Error");

            }
        }
    }
}
