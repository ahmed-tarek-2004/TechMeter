using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLessonComment
{
    public class AddLessonCommentCommandHandler(ILessonCommentService lessonCommentService) :
        IRequestHandler<AddLessonCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.AddLessonComment(request.userId, request.LessonId, request.Content);
        }
    }
}
