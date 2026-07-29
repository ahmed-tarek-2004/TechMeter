using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.ChangeLessonState
{
    public class WatchLessonCommandHandler(ILessonService lessonService) : IRequestHandler<WatchLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(WatchLessonCommand request, CancellationToken cancellationToken)
        {
            return await lessonService.StudentLessonWatched(request.StudentId, request.LessonId);
        }
    }
}
