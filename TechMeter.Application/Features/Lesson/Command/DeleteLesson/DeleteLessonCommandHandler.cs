using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.DeleteLesson
{
    public class DeleteLessonCommandHandler(ILessonService lessonService) : IRequestHandler<DeleteLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteLessonCommand request, CancellationToken cancellationToken)
        {
            return await lessonService.DeleteLessonAsync(request.Id);
        }
    }
}
