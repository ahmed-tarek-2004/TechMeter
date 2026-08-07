using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetStudentCourses
{
    public class GetStudentCoursesQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetStudentCoursesQuery, Response<List<GetStudentCourseResponse>>>
    {
        public async Task<Response<List<GetStudentCourseResponse>>> Handle(GetStudentCoursesQuery request, CancellationToken cancellationToken)
        {
            var courses = await context.CourseStudent.Where(b => b.StudentId == request.Id)
                .AsNoTracking()
                .Select(b => new GetStudentCourseResponse
                {
                    Id = b.Course.Id,
                    CategoryId = b.Course.CategoryId,
                    CourseProfileImageUrl = b.Course.CourseProfileImageUrl,
                    Description = b.Course.Description,
                    ProviderId = b.Course.ProviderId,
                    Title = b.Course.Title,
                    LessonCount = b.Course.LessonCount,
                    LastAccess = b.LastAccess,
                    Progress = b.Progrss,
                    SectionCount = b.Course.SectionCount,
                }).ToListAsync();

            return responseHandler.Success(courses, "Student Courses Returned Successfully");
        }
    }
}
