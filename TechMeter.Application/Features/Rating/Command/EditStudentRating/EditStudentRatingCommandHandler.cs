using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Rating;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.EditStudentRating
{
    public class EditStudentRatingCommandHandler(IApplicationDbContext context, ILogger<EditStudentRatingCommandHandler> logger,
        ResponseHandler responseHandler) : IRequestHandler<EditStudentRatingCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditStudentRatingCommand request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FindAsync(request.StudentId);
            if (Student == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<string>("User Not Found , Login/Register To Continue");
            }
            var Course = await context.Course.FindAsync(request.editStudentRatingRequest.CourseId);
            if (Course == null)
            {
                logger.LogWarning("Course is not found ");
                return responseHandler.BadRequest<string>("Course is not found ");
            }
            try
            {

                var StudentCourseRating = await context.UserCourseRating
                  .FirstOrDefaultAsync(r => r.StudentId == request.StudentId && r.CourseId == Course.Id);
                if (StudentCourseRating == null)
                {
                    return responseHandler.BadRequest<string>("Student didn't rate this Course before");
                }

                StudentCourseRating.Rating = request.editStudentRatingRequest.Rating;
                StudentCourseRating.Comment = request.editStudentRatingRequest.Comment;
                StudentCourseRating.UpdatedAt = request.editStudentRatingRequest.UpdatedAt;

                context.UserCourseRating.Update(StudentCourseRating);
                await context.SaveChangesAsync(cancellationToken);

                return responseHandler.Success(string.Empty, "Rating Edited Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }

        }
    }
}
