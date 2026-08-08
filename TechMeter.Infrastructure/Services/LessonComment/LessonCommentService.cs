using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services
{
    public class LessonCommentService(ApplicationDbContext context, ILessonCommentAuthorization lessonCommentAuthorization,
        ResponseHandler responseHandler, INotificationService notificationService) : ILessonCommentService
    {
        public async Task<Response<LessonCommentResponse>> AddLessonComment(string userId, string lessonId, string content, string? CommentParentId = null)
        {
            var user = await context.Users.FindAsync(userId);
            if (user == null)
            {
                return responseHandler.NotFound<LessonCommentResponse>("user is not found");
            }
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(lessonId);
            if (Lesson == null)
            {
                return responseHandler.NotFound<LessonCommentResponse>("Lesson is not found");
            }
            if (!string.IsNullOrEmpty(CommentParentId))
            {
                var CommentParentExists = await context.lessonComments.AnyAsync(b => b.Id == CommentParentId);
                if (!CommentParentExists)
                {
                    return responseHandler.NotFound<LessonCommentResponse>("Comment Parent is not found");
                }
            }
            try
            {
                if (!await lessonCommentAuthorization.HasCourseAccess(userId, Lesson.Value.CourseId))
                {
                    return responseHandler.Forbidden<LessonCommentResponse>("you don't have access to the course");
                }

                var comment = new Domain.Models.LessonComment
                {
                    Id = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    Content = content,
                    IsEdited = false,
                    LessonId = lessonId,
                    UserEmail = user.Email,
                    UserId = userId,
                    UserImage = user.ProfileUrl,
                    UserName = user.UserName ?? "",
                    ParentCommentId = CommentParentId

                };
                await context.AddAsync(comment);
                await context.SaveChangesAsync();
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
                    ParentCommentId = CommentParentId
                };
                return responseHandler.Success(response, "Comment Added Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<LessonCommentResponse>("internal server error");
            }

        }
        public async Task<Response<string>> DeleteLessonComment(string lessonId, string commentId, string userId, bool IsAdmin = false)
        {
            var comment = await context.lessonComments
                  .AnyAsync(b => b.Id == commentId && b.UserId == userId);

            if (!comment)
            {
                return responseHandler.NotFound<string>("Comment is not found");
            }
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(lessonId);

            if (Lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(userId, Lesson.Value.CourseId, IsAdmin))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }
            try
            {

                var rows = await lessonCommentAuthorization.CanDeleteAsync(userId, commentId, lessonId);

                if (rows == 0)
                {
                    return responseHandler.Forbidden<string>("you don't have access to delete");
                }
                else
                {
                    return responseHandler.Success(string.Empty, "Comment Deleted Successfully");
                }
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("internal server error");
            }
        }
        public async Task<Response<LessonCommentResponse>> EditLessonComment(string commentId, string userId, string content)
        {
            var comment = await context.lessonComments
                    .Where(b => b.Id == commentId && b.UserId == userId)
                    .FirstOrDefaultAsync();

            if (comment == null)
            {
                return responseHandler.NotFound<LessonCommentResponse>("Comment is not found");
            }
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(comment.LessonId);
            if (Lesson == null)
            {
                return responseHandler.NotFound<LessonCommentResponse>("Lesson is not found");
            }

            if (!await lessonCommentAuthorization.HasCourseAccess(userId, Lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<LessonCommentResponse>("you don't have access to the course");
            }

            try
            {



                comment.Content = content;
                comment.IsEdited = true;
                await context.SaveChangesAsync();
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
                return responseHandler.Success(response, "Comment Updated Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<LessonCommentResponse>("internal server error");
            }

        }
        public async Task<Response<List<LessonCommentResponse>>> GetAllLessonComment(string userId, string LessonId, bool isAdmin = false)
        {
            var lesson = await lessonCommentAuthorization.GetLessonAsync(LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<List<LessonCommentResponse>>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(userId, lesson.Value.CourseId, isAdmin))
            {
                return responseHandler.Forbidden<List<LessonCommentResponse>>("you don't have access to the course");
            }

            var comments = await context.lessonComments
           .Where(c => c.LessonId == LessonId)
           .AsNoTracking()
           .OrderBy(c => c.CreatedAt)
           .Select(c => new LessonCommentResponse
           {
               Id = c.Id,
               Content = c.Content,
               CreatedAt = c.CreatedAt,
               IsEdited = c.IsEdited,
               UserId = c.UserId,
               UserName = c.UserName,
               UserEmail = c.UserEmail,
               UserImage = c.UserImage,
               LessonId = c.LessonId,
               LikesCount = c.LessonCommentLikes.Count(),
               ParentCommentId = c.ParentCommentId
           })
           .ToListAsync();

            var lookup = comments.ToDictionary(c => c.Id);

            List<LessonCommentResponse> rootComments = [];

            foreach (var comment in comments)
            {
                if (comment.ParentCommentId is null)
                {
                    rootComments.Add(comment);
                }
                else if (lookup.TryGetValue(comment.ParentCommentId, out var parent))
                {
                    parent.Replies.Add(comment);
                }
            }


            return responseHandler.Success(rootComments, "Lesson Comments Retrived Successfully");
        }

        public async Task<Response<List<LessonCommentLikesResponse>>> GetCommentLikesAsync(string commentId, string userId, bool isAdmin = false)
        {
            var comment = await context.lessonComments.FirstOrDefaultAsync(b => b.Id == commentId);
            if (comment == null)
            {
                return responseHandler.NotFound<List<LessonCommentLikesResponse>>("comment is not found");
            }
            var lesson = await lessonCommentAuthorization.GetLessonAsync(comment.LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<List<LessonCommentLikesResponse>>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(userId, lesson.Value.CourseId, isAdmin))
            {
                return responseHandler.Forbidden<List<LessonCommentLikesResponse>>("you don't have access to the course");
            }
            var response = await context.LessonCommentLikes.Where(b => b.CommentId == commentId)
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

        public async Task<Response<string>> LikeOnComment(string CommentId, string UserId)
        {
            var user = await context.Users.FirstOrDefaultAsync(b => b.Id == UserId);

            var comment = await context.lessonComments.FirstOrDefaultAsync(b => b.Id == CommentId);
            if (comment == null)
            {
                return responseHandler.NotFound<string>("comment is not found");
            }
            var lesson = await lessonCommentAuthorization.GetLessonAsync(comment.LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson not found");
            }

            if (!await lessonCommentAuthorization.HasCourseAccess(UserId, lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }

            try
            {
                var lessonComemntLike = await context.LessonCommentLikes
                    .FirstOrDefaultAsync(b => b.UserId == UserId && b.CommentId == CommentId);

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
                    await context.SaveChangesAsync();
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
        public async Task<Response<string>> UnLikeOnComment(string CommentId, string UserId)
        {
            var comment = await context.lessonComments.FirstOrDefaultAsync(b => b.Id == CommentId);
            if (comment is null)
            {
                return responseHandler.NotFound<string>("comment is not found");
            }
            var lesson = await lessonCommentAuthorization.GetLessonAsync(comment.LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(UserId, lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }
            try
            {
                var rows = await context.LessonCommentLikes
                    .Where(b => b.UserId == UserId && b.CommentId == CommentId)
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
