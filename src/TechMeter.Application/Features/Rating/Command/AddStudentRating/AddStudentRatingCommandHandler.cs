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

namespace TechMeter.Application.Features.Rating.Command.AddStudentRating
{
    public class AddStudentRatingCommandHandler(IApplicationDbContext context,ILogger<AddStudentRatingCommandHandler> logger,
        ResponseHandler responseHandler) : IRequestHandler<AddStudentRatingCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddStudentRatingCommand request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FindAsync(request.studentId);
            if (Student == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<string>("User Not Found , Login/Register To Continue");
            }
            var Course = await context.Course.FindAsync(request.addStudentRatingRequest.CourseId);
            if (Course == null)
            {
                logger.LogWarning("Course is not found ");
                return responseHandler.BadRequest<string>("Course is not found ");

            }
            var existingRating = await context.UserCourseRating
              .FirstOrDefaultAsync(r => r.StudentId == request.studentId && r.CourseId == Course.Id);

            if (existingRating != null)
            {
                logger.LogWarning("Student already rated this Course");
                return responseHandler.BadRequest<string>("You already rated this Course");
            }
            try
            {
                var StudentCourseRating = new UserCourseRating()
                {

                    StudentId = request.studentId,
                    CourseId = Course.Id,
                    Comment = request.addStudentRatingRequest.Comment,
                    RatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Rating = request.addStudentRatingRequest.Rating,
                };

                await context.UserCourseRating.AddAsync(StudentCourseRating);
                await context.SaveChangesAsync(cancellationToken);

                return responseHandler.Success(string.Empty, "Rating Added Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
