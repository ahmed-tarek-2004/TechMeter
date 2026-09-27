using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.EditLesson
{
    public class EditLessonCommand:IRequest<Response<GetLessonResponse>>
    {
        public string Id { get; set; }
        public EditLessonRequest EditLessonRequest { get; set; }
    }
}
