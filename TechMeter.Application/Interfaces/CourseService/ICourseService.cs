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
        Task<Response<List<GetCourseResponse>>> GetCoursesAsync();
        Task<Response<AddCourseResponse>> AddCourseAsync(string providerId,AddCourseRequest request);
        Task<Response<GetCourseResponse>> EditCourseAsync(string providerId,EditCourseRequest request);
        Task<Response<string>> DeleteCourseByIdAsync(string responsiableId,string courseId);


    }
}
