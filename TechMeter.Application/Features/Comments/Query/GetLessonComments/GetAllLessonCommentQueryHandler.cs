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
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Query.GetLessonComments
{
    public class GetAllLessonCommentQueryHandler(ILessonCommentAuthorization lessonCommentAuthorization, 
        ResponseHandler responseHandler, IApplicationDbContext context) : IRequestHandler<GetAllLessonCommentQuery, Response<List<LessonCommentResponse>>>
    {
        public async Task<Response<List<LessonCommentResponse>>> Handle(GetAllLessonCommentQuery request, CancellationToken cancellationToken)
        {
            var lesson = await lessonCommentAuthorization.GetLessonAsync(request.LessonId);
            if (lesson == null)
            {
                return responseHandler.NotFound<List<LessonCommentResponse>>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(request.userId, lesson.Value.CourseId, request.isAdmin))
            {
                return responseHandler.Forbidden<List<LessonCommentResponse>>("you don't have access to the course");
            }

            var comments = await context.lessonComments
           .Where(c => c.LessonId == request.LessonId)
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
    }
}
