using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Command.AddStudentRating;
using TechMeter.Application.Features.Rating.Command.DeleteStudentRating;
using TechMeter.Application.Features.Rating.Command.EditStudentRating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Services.Rating
{
    public interface IRatingService
    {
        Task<Response<string>> AddRatingToCourse(string studentId, AddStudentRatingRequest command);
        Task<Response<string>> EditRatingToCourse(string studentId, EditStudentRatingRequest request);
        Task<Response<List<StudentCourseRatingDto>>> GetAllCourseRating(string ProviderId, string CourseId);
        Task<Response<StudentCourseRatingDto>> GetStudentCourseRating(string StudentId, string CourseId);
        Task<Response<string>> DeleteStudentCourseRating(string studentId, string courseId);
    }
}
