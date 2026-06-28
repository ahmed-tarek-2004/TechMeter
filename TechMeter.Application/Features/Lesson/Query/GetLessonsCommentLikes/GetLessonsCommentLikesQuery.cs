using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetLessonsCommentLikes
{
    public sealed record GetLessonsCommentLikesQuery(string commentId, string userId,bool isAdmin = false) : IRequest<Response<List<LessonCommentLikesResponse>>>;
}
