using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Comments.Command.LikeOnComment
{
    public sealed record LikeOnCommentCommand(string CommentId, string UserId) : IRequest<Response<string>>;
}
