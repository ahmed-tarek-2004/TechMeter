using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.EditComment
{
    public class EditCommentCommandHandler(IApplicationDbContext context, ILessonCommentAuthorization lessonCommentAuthorization,
        ResponseHandler responseHandler) : IRequestHandler<EditCommentCommand, Response<LessonCommentResponse>>
    {
        public async Task<Response<LessonCommentResponse>> Handle(EditCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await context.lessonComments
        .Where(b => b.Id == request.commentId && b.UserId == request.userId)
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

            if (!await lessonCommentAuthorization.HasCourseAccess(request.userId, Lesson.Value.CourseId))
            {
                return responseHandler.Forbidden<LessonCommentResponse>("you don't have access to the course");
            }

            try
            {

                comment.Content = request.content;
                comment.IsEdited = true;
                await context.SaveChangesAsync(cancellationToken);
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
    }
}
