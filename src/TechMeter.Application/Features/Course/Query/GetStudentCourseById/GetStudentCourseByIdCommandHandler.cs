using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetStudentCourseById
{
    public class GetStudentCourseByIdCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetStudentCourseByIdCommand, Response<GetCourseLearningCurriculumDto>>
    {
        public async Task<Response<GetCourseLearningCurriculumDto>> Handle(GetStudentCourseByIdCommand request, CancellationToken cancellationToken)
        {
            var userExists = await context.Users.AnyAsync(b => b.Id == request.userId, cancellationToken);
            if (!userExists)
            {
                return responseHandler.NotFound<GetCourseLearningCurriculumDto>("User is Not Found");
            }
            var courseExists = await context.Course.AnyAsync(b => b.Id == request.courseId, cancellationToken);
            if (!courseExists)
            {
                return responseHandler.NotFound<GetCourseLearningCurriculumDto>("User is Not Found");
            }
            var isEnrolled = await context.CourseStudent
                .AnyAsync(b => b.CourseId == request.courseId && b.StudentId == request.userId, cancellationToken);
            if (!isEnrolled)
            {
                return responseHandler.Forbidden<GetCourseLearningCurriculumDto>("Student Does not has access To This Course");
            }
            var response = await context.CourseStudent
               .Where(b => b.CourseId == request.courseId && b.StudentId == request.userId)
               .Select(b => new GetCourseLearningCurriculumDto
               {
                   Id = b.CourseId,
                   CourseProfileImageUrl = b.Course.CourseProfileImageUrl,
                   Description = b.Course.Description,
                   LessonCount = b.Course.LessonCount,
                   Progress = b.Progrss,
                   ProviderId = b.Course.ProviderId,
                   LastAccess = b.LastAccess,
                   Title = b.Course.Title,
                   SectionCount = b.Course.Sections.Count(),
                   Sections = b.Course.Sections.Select(b => new GetLearningSectionDto
                   {
                       Id = b.Id,
                       courseId = b.CourseId,
                       LessonCount = b.Lessons.Count(),
                       Name = b.Name,
                       Lessons = b.Lessons.Select(b => new DTO.Lesson.GetLessonResponse
                       {
                           Id = b.Id,
                           Name = b.Name,
                           Description = b.Description,
                           LessonUrl = b.LessonUrl,
                           SectionId = b.SectionId,
                       }).ToList()
                   }).ToList()
               }).FirstOrDefaultAsync(cancellationToken);

            return responseHandler.Success(response!, "Student Cource Returned Successfully");
        }
    }
}
