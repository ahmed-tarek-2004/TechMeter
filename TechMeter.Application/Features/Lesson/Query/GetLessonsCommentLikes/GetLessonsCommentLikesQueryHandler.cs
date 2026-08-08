using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetLessonsCommentLikes
{
    public class GetLessonsCommentLikesQueryHandler(ILessonCommentService lessonCommentService)
        : IRequestHandler<GetLessonsCommentLikesQuery, Response<List<LessonCommentLikesResponse>>>
    {
        public async Task<Response<List<LessonCommentLikesResponse>>> Handle(GetLessonsCommentLikesQuery request, CancellationToken cancellationToken)
        {
            return await lessonCommentService.GetCommentLikesAsync(request.commentId, request.userId,request.isAdmin);
        }
    }
}
