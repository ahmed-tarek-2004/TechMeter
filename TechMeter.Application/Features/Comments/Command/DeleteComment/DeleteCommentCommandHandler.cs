using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services.LessonComment;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.DeleteComment
{
    public class DeleteCommentCommandHandler(IApplicationDbContext context, ILessonCommentAuthorization lessonCommentAuthorization, ResponseHandler responseHandler) :
        IRequestHandler<DeleteCommentCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await context.lessonComments
      .AnyAsync(b => b.Id == request.commentId && b.UserId == request.userId);

            if (!comment)
            {
                return responseHandler.NotFound<string>("Comment is not found");
            }
            var Lesson = await lessonCommentAuthorization.GetLessonAsync(request.lessonId);

            if (Lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson is not found");
            }
            if (!await lessonCommentAuthorization.HasCourseAccess(request.userId, Lesson.Value.CourseId, request.IsAdmin))
            {
                return responseHandler.Forbidden<string>("you don't have access to the course");
            }
            try
            {

                var rows = await lessonCommentAuthorization.CanDeleteAsync(request.userId, request.commentId, request.lessonId);

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
    }
}
