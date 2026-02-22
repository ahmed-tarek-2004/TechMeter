using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.CourseService
{
    public interface ICourseService
    {
        Task<Response<GetCourseResponse>> GetCourseByIdAsync(string Id);
        Task<Response<List<GetCourseResponse>>> GetAllCoursesAsync();
        Task<Response<AddCourseResponse>> AddCourseAsync(string providerId,AddCourseRequest request);
<<<<<<< Updated upstream:TechMeter.Application/Interfaces/CourseService/ICourseService.cs
        Task<Response<GetCourseResponse>> EditCourseAsync(string providerId,EditCourseRequest request);
=======
        Task<Response<List<GetCourseResponse>>> GetProviderCoursesAsync(string providerId);
        Task<Response<GetCourseResponse>> EditCourseAsync(string providerId, string courseId, EditCourseRequest request);
>>>>>>> Stashed changes:TechMeter.Application/Interfaces/Course/ICourseService.cs
        Task<Response<string>> DeleteCourseByIdAsync(string responsiableId,string courseId);


    }
}
