using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.DeleteLessonComment
{
    public class DeleteLessonCommentCommandHandler(ILessonCommentService lessonCommentService)
        : IRequestHandler<DeleteLessonCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.DeleteLessonComment(request.lessonId, request.commentId, request.userId,request.isAdmin);
        }
    }
}
