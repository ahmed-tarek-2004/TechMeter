using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.DeleteComment
{
    public sealed record DeleteCommentCommand(string lessonId, string commentId, string userId, bool IsAdmin = false) : IRequest<Response<string>>;
}
