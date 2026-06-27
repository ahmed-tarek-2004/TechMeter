using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.LessonComment
{
    public interface ILessonCommentService
    {
        Task<Response<string>> AddLessonComment(string userId, string LessonId, string content);
        Task<Response<string>> DeleteLessonComment(string lessonId, string commentId, string userId);
        Task<Response<List<LessonCommentResponse>>> GetAllLessonComment(string UserId, string LessonId);
        //Task<Response<LessonCommentResponse>> GetLessonComment(string CommentId, string userId);
        Task<Response<string>> EditLessonComment(string CommentId,string lessonId, string userId, string content);
    }
}
