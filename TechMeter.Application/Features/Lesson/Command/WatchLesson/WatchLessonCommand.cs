using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.ChangeLessonState
{
    public class WatchLessonCommand : IRequest<Response<string>>
    {
        public string LessonId { get; set; }
        public string StudentId { get; set; }
    }
}
