using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetAllLessons
{
    public class GetAllLessonsQuery:IRequest<Response<List<GetLessonResponse>>>
    {

    }
}
