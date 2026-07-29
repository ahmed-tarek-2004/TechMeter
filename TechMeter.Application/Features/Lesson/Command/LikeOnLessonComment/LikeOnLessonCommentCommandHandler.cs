using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.LikeOnLessonComment
{
    public class LikeOnLessonCommentCommandHandler(ILessonCommentService lessonCommentService) : IRequestHandler<LikeOnLessonCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(LikeOnLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.LikeOnComment(request.commentId, request.userId);
        }
    }
}
