using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetCategoryById
{
    public class GetCourseByIdQueryHandler(ICourseService courseService) : IRequestHandler<GetCourseByIdQuery, Response<GetCourseResponse>>
    {
        public async Task<Response<GetCourseResponse>> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
        {
            return await courseService.GetCourseByIdAsync(request.Id);
        }
    }
}
