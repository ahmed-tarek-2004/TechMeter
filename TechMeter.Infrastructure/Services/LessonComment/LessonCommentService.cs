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
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services
{
    public class LessonCommentService(ApplicationDbContext context,ILessonCommentAuthorization lessonCommentAuthorization,
        ResponseHandler responseHandler) : ILessonCommentService
    {
        public async Task<Response<string>> AddLessonComment(string userId, string lessonId, string content)
        {
            var user = await context.Users.FindAsync(userId);
            if (user == null)
            {
                return responseHandler.NotFound<string>("user is not found");
            }
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(lessonId);
            if (Lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson is not found");
            }

            try
            {
                if (!await lessonCommentAuthorization.HasCourseAccess(userId, Lesson.Value.CourseId))
                {
                    return responseHandler.Forbidden<string>("you don't have access to the course");
                }

                var LessonComment = new Domain.Models.LessonComment
                {
                    Id = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    Content = content,
                    IsEdited = false,
                    LessonId = lessonId,
                    UserEmail = user.Email,
                    UserId = userId,
                    UserImage = "",
                    UserName = user.UserName ?? "",
                };
                await context.AddAsync(LessonComment);
                await context.SaveChangesAsync();
                return responseHandler.Success(string.Empty, "Comment Added Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("internal server error");
            }

        }

        public async Task<Response<string>> DeleteLessonComment(string lessonId, string commentId, string userId)
        {
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(lessonId);

            if (Lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(userId, Lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }

            try
            {

                var rows = await lessonCommentAuthorization.CanDeleteAsync(userId,commentId,lessonId);

                if (rows == 0)
                {
                    return responseHandler.NotFound<string>("Comment is not found");
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

        public async Task<Response<string>> EditLessonComment(string lessonId, string commentId, string userId, string content)
        {
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(lessonId);
            if (Lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson is not found");
            }

            if (!await lessonCommentAuthorization.HasCourseAccess(userId, Lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }

            try
            {

                var rows = await context.lessonComments
                    .Where(b => b.LessonId == lessonId && b.UserId == userId && b.Id == commentId)
                    .ExecuteUpdateAsync(b =>
                    b.SetProperty(p => p.Content, content)
                    .SetProperty(p => p.IsEdited, true));


                if (rows == 0)
                {
                    return responseHandler.NotFound<string>("Comment is not found");
                }
                else
                {
                    return responseHandler.Success(string.Empty, "Comment Updated Successfully");
                }
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("internal server error");
            }

        }

        public async Task<Response<List<LessonCommentResponse>>> GetAllLessonComment(string UserId, string LessonId)
        {
            var resposne = await context.lessonComments.Where(b => b.LessonId == LessonId)
                .Select(b => new LessonCommentResponse
                {
                    Id = b.Id,
                    Content = b.Content,
                    LessonId = b.LessonId,
                    CreatedAt = b.CreatedAt,
                    IsEdited = b.IsEdited,
                    UserEmail = b.UserEmail,
                    UserId = b.UserId,
                    UserImage = b.UserImage,
                    UserName = b.UserName,
                }).ToListAsync();
            return responseHandler.Success(resposne, "Lesson Comments Retrived Successfully");
        }

       
    }
}
