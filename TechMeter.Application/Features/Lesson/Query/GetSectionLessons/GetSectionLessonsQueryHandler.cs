using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetSectionLessons
{
    public class GetSectionLessonsQueryHandler(ILessonService lessonService) : IRequestHandler<GetSectionLessonsQuery, Response<List<GetLessonResponse>>>
    {
        public async Task<Response<List<GetLessonResponse>>> Handle(GetSectionLessonsQuery request, CancellationToken cancellationToken)
        {
           return await lessonService.GetSectionLessonResponse(request.SectionId);
        }
    }
}
