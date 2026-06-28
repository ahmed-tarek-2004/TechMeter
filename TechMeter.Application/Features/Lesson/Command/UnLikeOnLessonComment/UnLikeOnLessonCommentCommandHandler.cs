using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Features.Lesson.Command.LikeOnLessonComment;
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.UnLikeOnLessonComment
{
    public class UnLikeOnLessonCommentCommandHandler(ILessonCommentService lessonCommentService) : IRequestHandler<UnLikeOnLessonCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(UnLikeOnLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.UnLikeOnComment(request.commentId, request.userId);
        }
    }
}
