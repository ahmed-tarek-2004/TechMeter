using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.LikeOnLessonComment
{
    public sealed record LikeOnLessonCommentCommand(string commentId, string userId) : IRequest<Response<string>>;
}
