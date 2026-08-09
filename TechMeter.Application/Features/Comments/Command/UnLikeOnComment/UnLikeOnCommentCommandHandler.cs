using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.UnLikeOnComment
{
    public class UnLikeOnCommentCommandHandler(IApplicationDbContext context, ILessonCommentAuthorization lessonCommentAuthorization,
        ResponseHandler responseHandler) : IRequestHandler<UnLikeOnCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(UnLikeOnCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await context.lessonComments.FirstOrDefaultAsync(b => b.Id == request.CommentId);
            if (comment is null)
            {
                return responseHandler.NotFound<string>("comment is not found");
            }
            var lesson = await lessonCommentAuthorization.GetLessonAsync(comment.LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(request.UserId, lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }
            try
            {
                var rows = await context.LessonCommentLikes
                    .Where(b => b.UserId == request.UserId && b.CommentId == request.CommentId)
                    .ExecuteDeleteAsync();

                if (rows > 0)
                {
                    return responseHandler.Success(string.Empty, "Like removed successfully");
                }
                return responseHandler.Success(string.Empty, "Like already removed");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("internal server error");
            }
        }
    }
}
