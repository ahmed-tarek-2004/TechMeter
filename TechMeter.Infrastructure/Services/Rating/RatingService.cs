using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Command.AddStudentRating;
using TechMeter.Application.Features.Rating.Command.DeleteStudentRating;
using TechMeter.Application.Features.Rating.Command.EditStudentRating;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Rating
{
    public class RatingService:IRatingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<RatingService> _logger;
        public RatingService(ApplicationDbContext context, ResponseHandler responseHandler,
           ILogger<RatingService> logger)
        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
        }
        public async Task<Response<string>> AddRatingToCourse(AddStudentRatingCommand request)
        {

            var Student = await _context.Student.FindAsync(request.StudentId);
            if (Student == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<string>("User Not Found , Login/Register To Continue");
            }
            var Course = await _context.Course.FindAsync(request.CourseId);
            if (Course == null)
            {
                _logger.LogWarning("Course is not found ");
                return _responseHandler.BadRequest<string>("Course is not found ");

            }
            var existingRating = await _context.UserCourseRating
              .FirstOrDefaultAsync(r => r.StudentId == request.StudentId && r.CourseId == Course.Id);

            if (existingRating != null)
            {
                _logger.LogWarning("Student already rated this Course");
                return _responseHandler.BadRequest<string>("You already rated this Course");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var StudentCourseRating = new UserCourseRating()
                {

                    StudentId = request.StudentId,
                    CourseId = Course.Id,
                    Comment = request.Comment,
                    RatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Rating = request.Rating,
                };

                await _context.AddAsync(StudentCourseRating);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return _responseHandler.Success(string.Empty, "Rating Added Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        public async Task<Response<string>> DeleteStudentCourseionRating(DeleteStudentRatingCommand request)
        {
            var Student = await _context.Student.FindAsync(request.StudentId);
            if (Student == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<string>("User Not Found , Login/Register To Continue");
            }
            var Course = await _context.Course.FindAsync(request.CourseId);
            if (Course == null)
            {
                _logger.LogWarning("Course is not found ");
                return _responseHandler.BadRequest<string>("Course is not found ");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var StudentCourseRating = await _context.UserCourseRating
                  .FirstOrDefaultAsync(r => r.StudentId == request.StudentId && r.CourseId == Course.Id);
                if (StudentCourseRating == null)
                {
                    return _responseHandler.BadRequest<string>("Student didn't rate this Course");
                }

                _context.UserCourseRating.Remove(StudentCourseRating);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Deleted<string>("Rating Deleted Successfully");
            }
            catch (Exception ex)
            {

                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }

        }

        public async Task<Response<string>> EditRatingToCourse(EditStudentRatingCommand editStudentRatingRequest)
        {
            var Student = await _context.Student.FindAsync(editStudentRatingRequest.StudentId);
            if (Student == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<string>("User Not Found , Login/Register To Continue");
            }
            var Course = await _context.Course.FindAsync(editStudentRatingRequest.CourseId);
            if (Course == null)
            {
                _logger.LogWarning("Course is not found ");
                return _responseHandler.BadRequest<string>("Course is not found ");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var StudentCourseRating = await _context.UserCourseRating
                  .FirstOrDefaultAsync(r => r.StudentId == editStudentRatingRequest.StudentId && r.CourseId == Course.Id);
                if (StudentCourseRating == null)
                {
                    return _responseHandler.BadRequest<string>("Student didn't rate this Course before");
                }

                StudentCourseRating.Rating = editStudentRatingRequest.Rating;
                StudentCourseRating.Comment = editStudentRatingRequest.Comment;
                StudentCourseRating.UpdatedAt = editStudentRatingRequest.UpdatedAt;

                _context.UserCourseRating.Update(StudentCourseRating);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
              
                return _responseHandler.Success(string.Empty, "Rating Edited Successfully");

            }
            catch (Exception ex)
            {

                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }

        }


        public async Task<Response<StudentCourseRatingDto>> GetStudentCourseRating(string StudentId, string CourseId)
        {
            var Student = await _context.Student.FindAsync(StudentId);
            if (Student == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<StudentCourseRatingDto>("User Not Found , Login/Register To Continue");
            }
            var Course = await _context.Course.FindAsync(CourseId);
            if (Course == null)
            {
                _logger.LogWarning("Course is not found ");
                return _responseHandler.BadRequest<StudentCourseRatingDto>("Course is not found ");
            }

            var StudentCourseRating = await _context.UserCourseRating
                  .FirstOrDefaultAsync(r => r.StudentId == StudentId && r.CourseId == Course.Id);
            if (StudentCourseRating == null)
            {
                return _responseHandler.BadRequest<StudentCourseRatingDto>("Student didn't rate this Course before");
            }
            var respone = new StudentCourseRatingDto()
            {
                StudentId = StudentCourseRating.StudentId,
                CourseId = StudentCourseRating.CourseId,
                Comment = StudentCourseRating.Comment,
                Rating = StudentCourseRating.Rating,
                UpdatedAt = StudentCourseRating.UpdatedAt,
                RatedAt = StudentCourseRating.RatedAt,
            };
            return _responseHandler.Success(respone, "Rating returned Successfully");
        }

        public async Task<Response<List<StudentCourseRatingDto>>> GetAllCourseRating(string ProviderId, string CourseId)
        {
            var Provider = await _context.Provider.FindAsync(ProviderId);
            if (Provider == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<List<StudentCourseRatingDto>>("User Not Found , Login/Register To Continue");
            }
            var Course = await _context.Course.FindAsync(CourseId);
            if (Course == null)
            {
                _logger.LogWarning("Course is not found ");
                return _responseHandler.BadRequest<List<StudentCourseRatingDto>>("Course is not found ");
            }

            var StudentCourseRating = await _context.UserCourseRating
                  //.Include(b => b.Student)
                  //.Include(b => b.Course)
                  .Where(r => r.CourseId == Course.Id && r.Course.ProviderId == ProviderId)
                  .AsNoTracking()
                  .ToListAsync();

            if (StudentCourseRating == null)
            {
                return _responseHandler.BadRequest<List<StudentCourseRatingDto>>("Course not rated before");
            }

            var respone = StudentCourseRating.Select(c => new StudentCourseRatingDto
            {
                StudentId = c.StudentId,
                CourseId = c.CourseId,
                Comment = c.Comment,
                Rating = c.Rating,
                UpdatedAt = c.UpdatedAt,
                RatedAt = c.RatedAt,
            }).ToList();

            return _responseHandler.Success(respone, "Rating returned Successfully");
        }
    }
}
