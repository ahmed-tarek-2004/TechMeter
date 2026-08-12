using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.AddComment
{
    public class AddCommentCommandHandler(IApplicationDbContext context, ILessonCommentAuthorization lessonCommentAuthorization,
        ResponseHandler responseHandler, INotificationService notificationService) : IRequestHandler<AddCommentCommand, Response<LessonCommentResponse>>
    {
        public async Task<Response<LessonCommentResponse>> Handle(AddCommentCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FindAsync(request.userId);
            if (user == null)
            {
                return responseHandler.NotFound<LessonCommentResponse>("user is not found");
            }
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(request.lessonId);
            if (Lesson == null)
            {
                return responseHandler.NotFound<LessonCommentResponse>("Lesson is not found");
            }
            if (!string.IsNullOrEmpty(request.CommentParentId))
            {
                var CommentParentExists = await context.lessonComments.AnyAsync(b => b.Id == request.CommentParentId);
                if (!CommentParentExists)
                {
                    return responseHandler.NotFound<LessonCommentResponse>("Comment Parent is not found");
                }
            }
            try
            {
                if (!await lessonCommentAuthorization.HasCourseAccess(request.  userId, Lesson.Value.CourseId))
                {
                    return responseHandler.Forbidden<LessonCommentResponse>("you don't have access to the course");
                }

                var comment = new Domain.Models.LessonComment
                {
                    Id = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    Content = request.content,
                    IsEdited = false,
                    LessonId = request.lessonId,
                    UserEmail = user.Email,
                    UserId = request.userId,
                    UserImage = user.ProfileUrl,
                    UserName = user.UserName ?? "",
                    ParentCommentId = request.CommentParentId

                };
                await context.lessonComments.AddAsync(comment);
                await context.SaveChangesAsync(cancellationToken);
                await notificationService.SendUserNotifications(comment.UserId, " new Comment", $"{user.UserName} added an new comment", Domain.Enums.NotificationType.Comment);
                var response = new LessonCommentResponse
                {
                    Id = comment.Id,
                    LessonId = comment.LessonId,
                    IsEdited = comment.IsEdited,
                    Content = comment.Content,
                    CreatedAt = comment.CreatedAt,
                    UserEmail = comment.UserEmail,
                    UserId = comment.UserId,
                    UserImage = comment.UserImage,
                    UserName = comment.UserName,
                    ParentCommentId = comment.ParentCommentId
                };
                return responseHandler.Success(response, "Comment Added Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<LessonCommentResponse>("internal server error");
            }

        }
    }
}
