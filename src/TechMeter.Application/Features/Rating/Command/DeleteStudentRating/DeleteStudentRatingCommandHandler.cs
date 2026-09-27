using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.DeleteStudentRating
{
    public class DeleteStudentRatingCommandHandler(IApplicationDbContext context, ILogger<DeleteStudentRatingCommandHandler> logger,
        ResponseHandler responseHandler) : IRequestHandler<DeleteStudentRatingCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteStudentRatingCommand request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FindAsync(request.StudentId);
            if (Student == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<string>("User Not Found , Login/Register To Continue");
            }
            var Course = await context.Course.FindAsync(request.CourseId);
            if (Course == null)
            {
                logger.LogWarning("Course is not found ");
                return responseHandler.BadRequest<string>("Course is not found ");
            }
            try
            {

                var StudentCourseRating = await context.UserCourseRating
                  .FirstOrDefaultAsync(r => r.StudentId == request.StudentId && r.CourseId == request.CourseId);
                if (StudentCourseRating == null)
                {
                    return responseHandler.BadRequest<string>("Student didn't rate this Course");
                }

                context.UserCourseRating.Remove(StudentCourseRating);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Deleted<string>("Rating Deleted Successfully");
            }
            catch (Exception ex)
            {

                return responseHandler.InternalServerError<string>(ex.Message);
            }

        }
    }
}
