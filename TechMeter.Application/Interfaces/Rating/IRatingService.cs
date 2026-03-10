using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Rating
{
    public interface IRatingService
    {
        Task<Response<StudentCourseRatingDto>> AddRatingToCourse(string StudentId, AddStudentRatingRequest addStudentRatingRequest);
        Task<Response<StudentCourseRatingDto>> EditRatingToCourse(string StudentId, EditStudentRatingRequest editStudentRatingRequest);
        Task<Response<List<StudentCourseRatingDto>>> GetProdctRating(string sellerId, string CourseId);
        Task<Response<StudentCourseRatingDto>> GetStudentCourseRating(string StudentId, string CourseId);
        Task<Response<string>> DeleteStudentCourseionRating(string StudentId, string ratingId);
    }
}
