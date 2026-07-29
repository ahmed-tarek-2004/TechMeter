using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.Services.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetAllCourse
{
    public class GetAllCoursesQueryHandler(ICourseService courseService) : IRequestHandler<GetAllCoursesQuery, Response<List<GetCourseResponse>>>
    {
        public async Task<Response<List<GetCourseResponse>>> Handle(GetAllCoursesQuery request, CancellationToken cancellationToken)
        {
            return await courseService.GetAllCoursesAsync();
        }
    }
}
