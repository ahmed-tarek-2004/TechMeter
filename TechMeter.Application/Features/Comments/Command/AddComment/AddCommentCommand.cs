using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.AddComment
{
    public sealed record AddCommentCommand(string userId, string lessonId, string content, string? CommentParentId = null) : IRequest<Response<LessonCommentResponse>>;
}
