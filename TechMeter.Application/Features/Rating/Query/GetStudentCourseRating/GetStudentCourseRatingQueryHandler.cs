using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Query.GetStudentRating;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Query.GetStudentCourseRating
{
    public class GetStudentCourseRatingQueryHandler(IRatingService ratingService) : IRequestHandler<GetStudentCourseRatingQuery, Response<StudentCourseRatingDto>>
    {
        public async Task<Response<StudentCourseRatingDto>> Handle(GetStudentCourseRatingQuery request, CancellationToken cancellationToken)
        {
            return await ratingService.GetStudentCourseRating(request.StudentId, request.CourseId);
        }
    }
}
