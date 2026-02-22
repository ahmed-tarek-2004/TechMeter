using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Lesson
{
    public interface ILessonService
    {
        Task<Response<AddLessonResponse>>AddLessonAsync(AddLessonRequest addLessonRequest);
        Task<Response<GetLessonResponse>>EditLessonAsync(string Id,EditLessonRequest editLessonRequest);
        Task<Response<List<GetLessonResponse>>>GetALLessonAsync(string Id);
        Task<Response<GetLessonResponse>>GetALessonByIdAsync();
    }
}
