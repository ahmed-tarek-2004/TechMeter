using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetLessonById
{
    public class GetLessonByIdQueryHandler(ILessonService lessonService) : IRequestHandler<GetLessonByIdQuery, Response<GetLessonResponse>>
    {
        public async Task<Response<GetLessonResponse>> Handle(GetLessonByIdQuery request, CancellationToken cancellationToken)
        {
            return await lessonService.GetLessonByIdAsync(request.Id);
        }
    }
}
