using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.EditLesson
{
    public class EditLessonCommandHandler(ILessonService lessonService) : IRequestHandler<EditLessonCommand, Response<GetLessonResponse>>
    {
        public async Task<Response<GetLessonResponse>> Handle(EditLessonCommand request, CancellationToken cancellationToken)
        {
            return await lessonService.EditLessonAsync(request.Id, request.EditLessonRequest);
        }
    }
}
