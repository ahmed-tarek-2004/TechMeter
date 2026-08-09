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
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Query.GetProviderAllCourseRating
{
    public class GetProviderAllCourseRatingQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<GetProviderAllCourseRatingQueryHandler> logger) : IRequestHandler<GetProviderAllCourseRatingQuery, Response<List<StudentCourseRatingDto>>>
    {
        public async Task<Response<List<StudentCourseRatingDto>>> Handle(GetProviderAllCourseRatingQuery request, CancellationToken cancellationToken)
        {
            var Provider = await context.Provider.FindAsync(request.ProviderId);
            if (Provider == null)
            {
                logger.LogWarning("User is not found ");
                return responseHandler.NotFound<List<StudentCourseRatingDto>>("User Not Found , Login/Register To Continue");
            }
            var Course = await context.Course.FindAsync(request.CourseId);
            if (Course == null)
            {
                logger.LogWarning("Course is not found ");
                return responseHandler.BadRequest<List<StudentCourseRatingDto>>("Course is not found ");
            }

            var StudentCourseRating = await context.UserCourseRating
                  //.Include(b => b.Student)
                  //.Include(b => b.Course)
                  .Where(r => r.CourseId == Course.Id && r.Course.ProviderId == request.ProviderId)
                  .AsNoTracking()
                  .ToListAsync();

            if (StudentCourseRating == null)
            {
                return responseHandler.BadRequest<List<StudentCourseRatingDto>>("Course not rated before");
            }

            var respone = StudentCourseRating.Select(c => new StudentCourseRatingDto
            {
                StudentId = c.StudentId,
                CourseId = c.CourseId,
                Comment = c.Comment,
                Rating = c.Rating,
                UpdatedAt = c.UpdatedAt,
                RatedAt = c.RatedAt,
            }).ToList();

            return responseHandler.Success(respone, "Rating returned Successfully");
        }
    }

}
