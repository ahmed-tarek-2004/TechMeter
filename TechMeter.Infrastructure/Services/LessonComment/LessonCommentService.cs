using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
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
    public class LessonCommentService(ApplicationDbContext context, ResponseHandler responseHandler) : ILessonCommentService
    {
        public async Task<Response<string>> AddLessonComment(string userId, string LessonId, string content)
        {
            var user = await context.Users.FindAsync(userId);
            if (user == null)
            {
                return responseHandler.NotFound<string>("user is not found");
            }
            var Lesson = await context.Lessons.Where(b => b.Id == LessonId)
                .Select(b => new
                {
                    LessonId = b.Id,
                    CourseId = b.section.CourseId,
                }).FirstOrDefaultAsync();
            if (Lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson is not found");
            }

            await using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if (await IsSubscribed(userId, Lesson.CourseId))
                {
                    return responseHandler.Forbidden<string>("you don't have access to the course");
                }

                var LessonComment = new LessonComment
                {
                    Id = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    Content = content,
                    IsEdited = false,
                    LessonId = LessonId,
                    UserEmail = user.Email,
                    UserId = userId,
                    UserImage = "",
                    UserName = user.UserName ?? "",
                };
                await context.AddAsync(LessonComment);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return responseHandler.Success(string.Empty, "Lesson Added Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<string>("internal server error");
            }

        }

        public Task<Response<string>> DeleteLessonComment(string commentId, string userId)
        {
            throw new NotImplementedException();
        }

        public Task<Response<string>> EditLeessonComment(string CommentId, string userId)
        {
            throw new NotImplementedException();
        }

        public Task<Response<List<LessonCommentResponse>>> GetAllLessonComment(string UserId, string LessonId)
        {
            throw new NotImplementedException();
        }

        public Task<Response<LessonCommentResponse>> GetLessonComment(string CommentId, string userId)
        {
            throw new NotImplementedException();
        }


        private async Task<bool> IsSubscribed(string userId, string courseId = "")
        {
            var IsSubscribed = await context.CourseStudent.AnyAsync(b => b.StudentId == userId && b.CourseId == courseId);
            if (!IsSubscribed)
            {
                return await context.Course.AnyAsync(b => b.ProviderId == userId);
            }
            return IsSubscribed;
        }
    }
}
