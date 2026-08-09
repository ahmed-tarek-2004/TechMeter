using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Query.GetCommentLike
{
    public class GetCommentLikesQueryHandler(ILessonCommentAuthorization lessonCommentAuthorization, ResponseHandler responseHandler, 
        IApplicationDbContext context) : IRequestHandler<GetCommentLikesQuery, Response<List<LessonCommentLikesResponse>>>
    {
        public async Task<Response<List<LessonCommentLikesResponse>>> Handle(GetCommentLikesQuery request, CancellationToken cancellationToken)
        {
            var comment = await context.lessonComments.FirstOrDefaultAsync(b => b.Id == request.commentId);
            if (comment == null)
            {
                return responseHandler.NotFound<List<LessonCommentLikesResponse>>("comment is not found");
            }
            var lesson = await lessonCommentAuthorization.GetLessonAsync(comment.LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<List<LessonCommentLikesResponse>>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(request.userId, lesson.Value.CourseId, request.isAdmin))
            {
                return responseHandler.Forbidden<List<LessonCommentLikesResponse>>("you don't have access to the course");
            }
            var response = await context.LessonCommentLikes.Where(b => b.CommentId == request.commentId)
                .Select(b => new LessonCommentLikesResponse
                {
                    CommentId = b.CommentId,
                    AddedAt = b.AddedAt,
                    UserEmail = b.UserEmail,
                    UserId = b.UserId,
                    UserName = b.UserName,
                    UserImage = b.UserImage,
                }).ToListAsync();
            return responseHandler.Success(response, "Comment Likes Returned Successfully");
        }
    }
}
