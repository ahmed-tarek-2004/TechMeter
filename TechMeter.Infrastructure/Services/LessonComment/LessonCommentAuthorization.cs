using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Models;
using TechMeter.Infrastructure.Persistence.AppDbContext;

namespace TechMeter.Infrastructure.Services.LessonComment
{
    public class LessonCommentAuthorization(ApplicationDbContext context, UserManager<Domain.Models.Auth.Identity.User> userManager)
        : ILessonCommentAuthorization
    {
        public async Task<bool> HasCourseAccess(string userId, string courseId, bool IsAdmin = false)
        {
            var hasAccess = await context.CourseStudent
                       .AnyAsync(x => x.StudentId == userId && x.CourseId == courseId);

            if (hasAccess)
                return true;

            hasAccess = await context.Course
                .AnyAsync(x => x.Id == courseId && x.ProviderId == userId);

            if (hasAccess)
                return true;



            if (!IsAdmin)
                return false;

            return true;
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

            bool isAdmin = roles.Contains("admin");
            bool isProvider = roles.Contains("provider");
            bool canDelete = false;

            if (isAdmin)
            {
                canDelete = true;
            }
            else if (isProvider)
            {
                canDelete = await context.lessonComments.AnyAsync(c => c.Lesson.section.Course.ProviderId == userId);
            }
            else
            {
                canDelete = await context.lessonComments.AnyAsync(c => c.UserId == userId && c.LessonId == LessonId);
            }
            if (!canDelete)
                return 0;
            var sql = @"
        WITH CommentTree AS (
            SELECT Id FROM lessonComments WHERE Id = {0}
            
            UNION ALL
            
            SELECT c.Id FROM lessonComments c
            INNER JOIN CommentTree ct ON c.ParentCommentId = ct.Id
        )
        DELETE FROM lessonComments 
        WHERE Id IN (SELECT Id FROM CommentTree)
        OPTION (MAXRECURSION 0);";

            return await context.Database.ExecuteSqlRawAsync(sql, CommentId);
        }
    }
}
