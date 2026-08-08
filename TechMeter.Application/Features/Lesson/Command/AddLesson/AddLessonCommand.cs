using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommand:IRequest<Response<GetLessonResponse>>
    {
        public string SectionId { get; set; }
        public AddLessonRequest AddLessonRequest { get; set; }
    }
}
