using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.ChangeLessonState
{
    public class ChangeLessonStateCommandHandler(ILessonService lessonService) : IRequestHandler<ChangeLessonStateCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ChangeLessonStateCommand request, CancellationToken cancellationToken)
        {
            return await lessonService.StudentLessonWatchedAndUnWatched(request.StudentId, request.LessonId);
        }
    }
}
