using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.DeleteLesson
{
    public class DeleteLessonCommand:IRequest<Response<string>>
    {
        public string Id { get; set; }
    }
}
