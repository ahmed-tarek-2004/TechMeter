using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetSectionLessons
{
    public class GetSectionLessonsQuery : IRequest<Response<List<GetLessonResponse>>>
    {
        public string SectionId { get; set; }
    }
}
