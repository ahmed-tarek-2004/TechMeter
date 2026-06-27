using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLessonComment
{
    public sealed record AddLessonCommentCommand(string userId, string LessonId, string Content) : IRequest<Response<LessonCommentResponse>>;
}
