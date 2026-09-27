using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Query.GetStudentRating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Query.GetStudentCourseRating
{
    public class GetStudentCourseRatingQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<GetStudentCourseRatingQueryHandler> logger) : IRequestHandler<GetStudentCourseRatingQuery, Response<StudentCourseRatingDto>>
    {
        public async Task<Response<StudentCourseRatingDto>> Handle(GetStudentCourseRatingQuery request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FindAsync(request.StudentId);
            if (Student == null)
            {
                logger.LogWarning("User is not found");
                return responseHandler.NotFound<StudentCourseRatingDto>("User Not Found , Login/Register To Continue");
            }
            var Course = await context.Course.FindAsync(request.CourseId);
            if (Course == null)
            {
                logger.LogWarning("Course is not found ");
                return responseHandler.BadRequest<StudentCourseRatingDto>("Course is not found ");
            }

            var StudentCourseRating = await context.UserCourseRating
                  .FirstOrDefaultAsync(r => r.StudentId == request.StudentId && r.CourseId == request.CourseId);
            if (StudentCourseRating == null)
            {
                return responseHandler.BadRequest<StudentCourseRatingDto>("Student didn't rate this Course before");
            }
            var respone = new StudentCourseRatingDto()
            {
                StudentId = StudentCourseRating.StudentId,
                CourseId = StudentCourseRating.CourseId,
                Comment = StudentCourseRating.Comment,
                Rating = StudentCourseRating.Rating,
                UpdatedAt = StudentCourseRating.UpdatedAt,
                RatedAt = StudentCourseRating.RatedAt,
            };
            return responseHandler.Success(respone, "Rating returned Successfully");
        }
    }
}
