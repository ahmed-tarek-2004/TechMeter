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
        Task<Response<GetLessonResponse>>AddLessonAsync(string sectionId,AddLessonRequest addLessonRequest);
        Task<Response<string>> StudentLessonWatchedAndUnWatched(string studentId,string LessonId);
        Task<Response<List<GetLessonResponse>>> GetStudentLessonWatched(string studentId);
        Task<Response<GetLessonResponse>>EditLessonAsync(string Id,EditLessonRequest editLessonRequest);
        Task<Response<List<GetLessonResponse>>>GetALLessonAsync();
        Task<Response<GetLessonResponse>> GetLessonByIdAsync(string Id);
        Task<Response<List<GetLessonResponse>>> GetSectionLessonResponse(string sectionId);
        Task<Response<string>> DeleteLessonAsync(string Id);
    }
}
