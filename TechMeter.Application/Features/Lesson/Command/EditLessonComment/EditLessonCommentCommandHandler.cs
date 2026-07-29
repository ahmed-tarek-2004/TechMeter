using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.EditLessonComment
{
    public class EditLessonCommentCommandHandler(ILessonCommentService lessonCommentService)
        : IRequestHandler<EditLessonCommentCommand, Response<LessonCommentResponse>>
    {
        public async Task<Response<LessonCommentResponse>> Handle(EditLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.EditLessonComment(request.commentId, request.userId, request.content);
        }
    }
}
