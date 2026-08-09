using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.UnLikeOnComment
{
    public sealed record UnLikeOnCommentCommand(string CommentId, string UserId) : IRequest<Response<string>>;
}
