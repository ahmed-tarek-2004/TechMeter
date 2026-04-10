using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Query.GetProviderAllCourseRating
{
    public class GetProviderAllCourseRatingQueryHandler(IRatingService ratingService) : IRequestHandler<GetProviderAllCourseRatingQuery, Response<List<StudentCourseRatingDto>>>
    {
        public async Task<Response<List<StudentCourseRatingDto>>> Handle(GetProviderAllCourseRatingQuery request, CancellationToken cancellationToken)
        {
            return await ratingService.GetAllCourseRating(request.ProviderId, request.CourseId);
        }
    }
}
