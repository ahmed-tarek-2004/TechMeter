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
        Task<Response<LessonCommentResponse>> AddLessonComment(string userId, string LessonId, string content, string? ParentCommentId = null);
        Task<Response<string>> DeleteLessonComment(string lessonId, string commentId, string userId, bool isAdmin = false);
        Task<Response<List<LessonCommentResponse>>> GetAllLessonComment(string UserId, string LessonId, bool isAdmin = false);
        //Task<Response<LessonCommentResponse>> GetLessonComment(string CommentId, string userId, bool isAdmin);
        Task<Response<LessonCommentResponse>> EditLessonComment(string CommentId, string userId, string content);
        Task<Response<string>> LikeOnComment(string CommentId, string UserId);
        Task<Response<string>> UnLikeOnComment(string CommentId, string UserId);
        Task<Response<List<LessonCommentLikesResponse>>> GetCommentLikesAsync(string CommentId, string UserId, bool isAdmin = false);
    }
}
