using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetAllLessons
{
    public class GetCourseLessonsQueryHandler(ILessonService lessonService) : IRequestHandler<GetCourseLessonsQuery, Response<List<GetLessonResponse>>>
    {
        public async Task<Response<List<GetLessonResponse>>> Handle(GetCourseLessonsQuery request, CancellationToken cancellationToken)
        {
            return await lessonService.GetCourseLessonsAsync(request.courseId);
        }
    }
}
