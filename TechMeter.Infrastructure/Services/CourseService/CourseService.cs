using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.CourseService;

namespace TechMeter.Infrastructure.Services.CourseService
{
    public class CourseService : ICourseService
    {
        
        public Task<AddCourseResponse> AddCourseAsync(AddCourseRequest request)
        {
            throw new NotImplementedException();
        }

        public Task<GetCourseResponse> GetCourseByIdAsync(string Id)
        {
            throw new NotImplementedException();
        }

        public Task<List<GetCourseResponse>> GetCoursesAsync()
        {
            throw new NotImplementedException();
        }
    }
}
