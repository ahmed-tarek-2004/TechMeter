using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.UnWatchLesson
{
    public class UnWatchLessonCommandHandler(ILessonService lessonService) : IRequestHandler<UnWatchLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(UnWatchLessonCommand request, CancellationToken cancellationToken)
        {
            return await lessonService.StudentLessonUnwatched(request.StudentId, request.LessonId);
        }
    }
}
