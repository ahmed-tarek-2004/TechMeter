using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLessonComment
{
    public class AddLessonCommentCommandHandler(ILessonCommentService lessonCommentService) :
        IRequestHandler<AddLessonCommentCommand, Response<LessonCommentResponse>>
    {
        public async Task<Response<LessonCommentResponse>> Handle(AddLessonCommentCommand request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.AddLessonComment(request.userId, request.LessonId, request.Content,request.commentParentId);
        }
    }
}
