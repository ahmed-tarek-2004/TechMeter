using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Course;

namespace TechMeter.Application.Features.Course.Query.GetProviderCourses
{
    public class GetProviderCoursesQueryHandler(ICourseService courseService):IRequestHandler<GetProviderCoursesQuery, Domain.Shared.Bases.Response<List<DTO.Course.GetCourseResponse>>>
    {
        public async Task<Domain.Shared.Bases.Response<List<DTO.Course.GetCourseResponse>>> Handle(GetProviderCoursesQuery request, CancellationToken cancellationToken)
        {
            return await courseService.GetProviderCoursesAsync(request.Id);
        }
    }
}
