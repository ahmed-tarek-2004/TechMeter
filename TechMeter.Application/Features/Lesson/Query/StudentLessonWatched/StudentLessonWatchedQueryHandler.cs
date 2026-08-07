using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.StudentLessonWatched
{
    public class StudentLessonWatchedQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<StudentLessonWatchedQuery, Response<List<GetLessonResponse>>>
    {
        public async Task<Response<List<GetLessonResponse>>> Handle(StudentLessonWatchedQuery request, CancellationToken cancellationToken)
        {
            var lessons = await context.StudentLessonWatched
               .Where(slw => slw.StudentId == request.StudentId)
               .Select(b => new GetLessonResponse
               {
                   Id = b.LessonId,
                   Description = b.Lessons.Description,
                   //LessonUrl = b.lesson.LessonUrl,
                   Name = b.Lessons.Name,
                   SectionId = b.Lessons.SectionId,
               }).ToListAsync();
            return responseHandler.Success(lessons, "Lesson Watched Returned Successfully");
        }
    }
}
