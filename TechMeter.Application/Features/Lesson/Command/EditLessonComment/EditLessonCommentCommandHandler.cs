using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.EditLessonComment
{
    public class EditLessonCommentCommandHandler(ILessonCommentService lessonCommentService)
        : IRequestHandler<EditLessonCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.EditLessonComment(request.commentId, request.lessonId, request.userId, request.content);
        }
    }
}
