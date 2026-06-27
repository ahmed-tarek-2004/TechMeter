using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.LessonComment;
using TechMeter.Domain.Models;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.LessonComment
{
    public class LessonCommentAuthorization(ApplicationDbContext context, UserManager<Domain.Models.Auth.Identity.User> userManager)
        : ILessonCommentAuthorization
    {
        public async Task<bool> HasCourseAccess(string userId, string courseId)
        {
            var IsSubscribed = await context.CourseStudent.AnyAsync(b => b.StudentId == userId && b.CourseId == courseId);
            if (!IsSubscribed)
            {
                return await context.Course.AnyAsync(b => b.ProviderId == userId && b.Id == courseId);
            }
            return IsSubscribed;
        }
        public async Task<(string LessonId, string CourseId)?> GetLessonAsync(string lessonId)
        {
            return await context.Lessons
                .Where(x => x.Id == lessonId)
                .Select(x => new ValueTuple<string, string>
                (
                    x.Id,
                    x.section.CourseId
                ))
                .FirstOrDefaultAsync();
        }

        public async Task<int> CanDeleteAsync(string userId, string CommentId, string LessonId)
        {
            var user = await context.Users.FindAsync(userId);
            var roles = await userManager.GetRolesAsync(user!);
            if (roles.Contains("admin"))
            {
                return await context.lessonComments.Where(b => b.Id == CommentId).ExecuteDeleteAsync();
            }
            else if (roles.Contains("provider"))
            {
                return await context.lessonComments.Where(b => b.Id == CommentId && b.Lesson.section.Course.ProviderId == userId)
                    .ExecuteDeleteAsync();
            }
            else
            {
                return await context.lessonComments
                    .Where(b => b.LessonId == LessonId && b.UserId == userId && b.Id == CommentId)
                    .ExecuteDeleteAsync();
            }
        }
    }
}
