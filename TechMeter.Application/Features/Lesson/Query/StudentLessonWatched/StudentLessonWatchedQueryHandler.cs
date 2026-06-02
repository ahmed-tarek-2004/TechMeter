using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.StudentLessonWatched
{
    public class StudentLessonWatchedQueryHandler(ILessonService lessonService) : IRequestHandler<StudentLessonWatchedQuery, Response<List<GetLessonResponse>>>
    {
        public async Task<Response<List<GetLessonResponse>>> Handle(StudentLessonWatchedQuery request, CancellationToken cancellationToken)
        {
            return await lessonService.GetStudentLessonWatched(request.StudentId);
        }
    }
}
