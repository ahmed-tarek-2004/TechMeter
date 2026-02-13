using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;

namespace TechMeter.Application.Interfaces.CourseService
{
    public interface ICourseService
    {
        Task<GetCourseResponse> GetCourseByIdAsync(string Id);
        Task<List<GetCourseResponse>> GetCoursesAsync();
        Task<AddCourseResponse> AddCourseAsync(AddCourseRequest request);
    }
}
