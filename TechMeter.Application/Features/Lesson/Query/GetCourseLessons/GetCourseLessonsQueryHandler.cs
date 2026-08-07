using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetAllLessons
{
    public class GetCourseLessonsQueryHandler(IApplicationDbContext context , ResponseHandler responseHandler) : IRequestHandler<GetCourseLessonsQuery, Response<List<GetLessonResponse>>>
    {
        public async Task<Response<List<GetLessonResponse>>> Handle(GetCourseLessonsQuery request, CancellationToken cancellationToken)
        {
            var lessons = context.Lessons
               .AsNoTracking()
               .Where(l => l.section.CourseId == request.courseId)
               .AsQueryable();
            var respone = await CreateALessonResponse(lessons);
            return responseHandler.Success(respone, "Course lessons returned successfully");
        }
        private async Task<List<GetLessonResponse>> CreateALessonResponse(IQueryable<TechMeter.Domain.Models.Lessons> lesson)
        {
            var response = await lesson.Select(b => new GetLessonResponse()
            {
                Id = b.Id,
                Description = b.Description,
                //LessonUrl = lesson.LessonUrl,
                Name = b.Name,
                SectionId = b.SectionId,
            }).ToListAsync();
            return response;
        }
    }
}
