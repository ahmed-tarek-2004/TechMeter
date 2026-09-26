using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command
{
    public sealed record EditLessonOrderCommand(List<string> LessonsId, string SectionId) : IRequest<Response<string>>;
}
