using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetLessonComments
{
    public class GetLessonCommentsQueryHandler(ILessonCommentService lessonCommentService) :
        IRequestHandler<GetLessonCommentsQuery, Response<List<LessonCommentResponse>>>
    {
        public async Task<Response<List<LessonCommentResponse>>> Handle(GetLessonCommentsQuery request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.GetAllLessonComment(request.userId, request.LessonId);
        }
    }
}
