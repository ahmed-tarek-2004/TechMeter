using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetLessonComments
{
    public sealed record GetLessonCommentsQuery(string userId,string LessonId) : IRequest<Response<List<LessonCommentResponse>>>;
}
