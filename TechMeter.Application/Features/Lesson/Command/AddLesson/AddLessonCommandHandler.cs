using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandHandler(ILessonService lessonService) : IRequestHandler<AddLessonCommand, Response<GetLessonResponse>>
    {
        public async Task<Response<GetLessonResponse>> Handle(AddLessonCommand request, CancellationToken cancellationToken)
        {
            return await lessonService.AddLessonAsync(request.SectionId,request.request);
        }
    }
}
