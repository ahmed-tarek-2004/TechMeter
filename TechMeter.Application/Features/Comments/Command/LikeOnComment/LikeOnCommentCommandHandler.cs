using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.LikeOnComment
{
    public class LikeOnCommentCommandHandler(IApplicationDbContext context, ILessonCommentAuthorization lessonCommentAuthorization,
        INotificationService notificationService, ResponseHandler responseHandler) : IRequestHandler<LikeOnCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(LikeOnCommentCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(b => b.Id == request.UserId);

            var comment = await context.lessonComments.FirstOrDefaultAsync(b => b.Id == request.CommentId);
            if (comment == null)
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
                var lessonComemntLike = await context.LessonCommentLikes
                    .FirstOrDefaultAsync(b => b.UserId == request.UserId && b.CommentId == request.CommentId);

                if (lessonComemntLike is null)
                {
                    var lessonCommentLike = new LessonCommentLike
                    {
                        CommentId = comment.Id,
                        UserEmail = user.Email,
                        UserId = user.Id,
                        UserImage = user.ProfileUrl ?? "",
                        UserName = user.UserName,
                        AddedAt = DateTime.UtcNow,
                    };
                    await context.LessonCommentLikes.AddAsync(lessonCommentLike);
                    await context.SaveChangesAsync(cancellationToken);
                    await notificationService.SendUserNotifications(comment.UserId, "Like on Your Comment", $"{user.UserName} Liked on your comment", Domain.Enums.NotificationType.Like);
                    return responseHandler.Success(string.Empty, "Like added successfully");
                }
                return responseHandler.Success(string.Empty, "Like already added");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("internal server error");
            }
        }
    }
}
