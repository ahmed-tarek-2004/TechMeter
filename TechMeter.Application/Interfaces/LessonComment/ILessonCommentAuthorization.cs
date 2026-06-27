using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.LessonComment
{
    public interface ILessonCommentAuthorization
    {
        Task<bool> HasCourseAccess(string userId, string courseId);
        Task<(string LessonId, string CourseId)?> GetLessonAsync(string lessonId);
        Task<int> CanDeleteAsync(string userId, string CommentId, string LessonId);
    }
}
