using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.CourseService
{
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<CourseService> _logger;
        private readonly IImageUploading _imageUploading;
        private readonly UserManager<User> _userManager;
        public CourseService(ApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<CourseService> logger, IImageUploading imageUploading, UserManager<User> userManager)

        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
            _imageUploading = imageUploading;
            _userManager = userManager;
        }

        public async Task<Response<AddCourseResponse>> AddCourseAsync(string providerId, AddCourseRequest request)
        {
            var provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == providerId);
            if (provider == null)
            {
                return _responseHandler.BadRequest<AddCourseResponse>("Provider Is Not Found");
            }

            var category = await _context.Category.FirstOrDefaultAsync(b => b.Id == request.CategoryId);
            if (category == null)
            {
                return _responseHandler.NotFound<AddCourseResponse>("Category Is Not Found");
            }

            string imageUrl = "";
            try
            {
                imageUrl = request.CourseProfileImageUrl == null ? "Empty" : await _imageUploading.UploadAsync(request.CourseProfileImageUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error Occurred while uploading Image");
                imageUrl = "Empty";
            }


            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var course = new Course()
                {
                    Id = Guid.NewGuid().ToString(),
                    CourseProfileImageUrl = imageUrl,
                    CategoryId = request.CategoryId,
                    Description = request.Description,
                    Title = request.Title,
                    ProviderId = providerId,
                };
                await _context.AddAsync(course);
                await _context.SaveChangesAsync();
                var response = new AddCourseResponse()
                {
                    Id = course.Id,
                    CourseProfileImageUrl = course.CourseProfileImageUrl,
                    Description = course.Description,
                    Title = course.Title,
                    CategoryId = course.CategoryId,
                };
                await transaction.CommitAsync();
                return _responseHandler.Success(response, "Course Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<AddCourseResponse>(ex.Message);
            }
        }


        public async Task<Response<GetCourseResponse>> GetCourseByIdAsync(string courseId)
        {
            var course = await _context.Course.AsNoTracking().FirstOrDefaultAsync(b => b.Id == courseId);
            if (course == null)
            {
                return _responseHandler.NotFound<GetCourseResponse>("Course is not found");
            }
            var response = new GetCourseResponse()
            {
                Id = course.Id,
                CategoryId = course.CategoryId,
                CourseProfileImageUrl = course.CourseProfileImageUrl,
                Description = course.Description,
                ProviderId = course.ProviderId,
                Title = course.Title,
            };

            return _responseHandler.Success(response, "Course Returned Successfully");
        }

        public async Task<Response<List<GetCourseResponse>>> GetAllCoursesAsync()
        {
            var response = await _context.Course.Select(b => new GetCourseResponse
            {
                Id = b.Id,
                ProviderId = b.ProviderId,
                CategoryId = b.CategoryId,
                CourseProfileImageUrl = b.CourseProfileImageUrl,
                Description = b.Description,
                Title = b.Title,
            }).ToListAsync();
            return _responseHandler.Success(response, "All Courses Returned Successfully");
        }

        public async Task<Response<List<GetCourseResponse>>> GetProviderCoursesAsync(string providerId)
        {
            var provider = await _context.Provider.FindAsync(providerId);
            if (provider == null)
            {
                return _responseHandler.NotFound<List<GetCourseResponse>>("Provider is not found");
            }
            var coursesResponse = await _context.Course.Where(b => b.ProviderId == providerId).Select(b => new GetCourseResponse()
            {
                Id = b.Id,
                CategoryId = b.CategoryId,
                ProviderId = b.ProviderId,
                Description = b.Description,
                Title = b.Title,
            }).ToListAsync();
            return _responseHandler.Success(coursesResponse, "Courses returned successfully");
        }

        public async Task<Response<GetCourseResponse>> EditCourseAsync(string providerId, string courseId, EditCourseRequest request)
        {
            var provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == providerId);
            if (provider == null)
            {
                return _responseHandler.BadRequest<GetCourseResponse>("Provider Is Not Found");
            }
            var course = await _context.Course.FindAsync(courseId);
            if (course == null)
            {
                return _responseHandler.NotFound<GetCourseResponse>("Course is not Found");
            }
            var category = await _context.Category.FindAsync(request.CategoryId);
            if (category == null)
            {
                return _responseHandler.NotFound<GetCourseResponse>("category is not Found");
            }
            if (request.CourseProfileImageUrl != null)
            {
                course.CourseProfileImageUrl = await _imageUploading.UploadAsync(request.CourseProfileImageUrl);
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                course.ProviderId = providerId;
                course.CategoryId = request.CategoryId;
                course.Description = request.Description;
                course.Title = request.Title;

                await _context.SaveChangesAsync();

                var response = new GetCourseResponse()
                {
                    Id = course.Id,
                    CategoryId = course.CategoryId,
                    CourseProfileImageUrl = course.CourseProfileImageUrl,
                    Description = course.Description,
                    ProviderId = course.ProviderId,
                    Title = course.Title,
                };

                await transaction.CommitAsync();
                return _responseHandler.Success(response, "Course Updated Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetCourseResponse>(ex.Message);
            }
        }

        public async Task<Response<string>> DeleteCourseByIdAsync(string responsiableId, string courseId)
        {
            var responisble = await _userManager.FindByIdAsync(responsiableId);
            if (responisble == null)
            {
                return _responseHandler.BadRequest<string>("Responsible Is Not Found");
            }
            var course = await _context.Course.FindAsync(courseId);
            if (course == null)
            {
                return _responseHandler.NotFound<string>("Course is not Found");
            }
            var role = await _userManager.GetRolesAsync(responisble);
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Remove(course);
                await _context.SaveChangesAsync();
                /*
                 checking role for provider for Sending notification and email message 
                 */


                await transaction.CommitAsync();
                return _responseHandler.Success("", "course Deleted Successfully");
            }
            catch (Exception ex)
            {
                return _responseHandler.InternalServerError<string>("Internal Server Error");
            }
        }
    }
}
