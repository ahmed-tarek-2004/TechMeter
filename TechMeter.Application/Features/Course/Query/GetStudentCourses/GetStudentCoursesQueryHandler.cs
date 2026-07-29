using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.Services.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetStudentCourses
{
    public class GetStudentCoursesQueryHandler(ICourseService courseService) : IRequestHandler<GetStudentCoursesQuery, Response<List<GetStudentCourseResponse>>>
    {
        public async Task<Response<List<GetStudentCourseResponse>>> Handle(GetStudentCoursesQuery request, CancellationToken cancellationToken)
        {
            return await courseService.GetStudentCoursesAsync(request.Id);
        }
    }
}
