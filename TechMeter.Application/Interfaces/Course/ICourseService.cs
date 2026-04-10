using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Course.Command.AddCourse;
using TechMeter.Application.Features.Course.Command.DeleteCourse;
using TechMeter.Application.Features.Course.Command.EditCourse;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.CourseService
{
    public interface ICourseService
    {
        Task<Response<GetCourseResponse>> GetCourseByIdAsync(string Id);
        Task<Response<List<GetCourseResponse>>> GetAllCoursesAsync();
        Task<Response<AddCourseResponse>> AddCourseAsync(AddCourseCommand request);
        Task<Response<List<GetCourseResponse>>> GetProviderCoursesAsync(string providerId);
        Task<Response<string>> EditCourseAsync(EditCourseCommand request);
        Task<Response<string>> DeleteCourseByIdAsync(DeleteCourseCommand request);
        Task<Response<List<GetStudentCourseResponse>>> GetStudentCoursesAsync(string StudentId);


    }
}
