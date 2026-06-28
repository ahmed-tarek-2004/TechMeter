using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.DeleteLessonComment
{
    public sealed record DeleteLessonCommentCommand(string lessonId, string commentId, string userId,bool isAdmin = false) : IRequest<Response<string>>;
}
