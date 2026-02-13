using Azure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Category
{
    public class CategoryService : ICategoryService
    {
        public readonly ApplicationDbContext _context;
        public readonly ResponseHandler _responseHandler;
        public CategoryService(ApplicationDbContext context, ResponseHandler responseHandler)
        {
            _context = context;
            _responseHandler = responseHandler;
        }
        public async Task<Domain.Shared.Bases.Response<AddCategoryResponse>> AddCategoryAsync(AddCategoryRequest addCategoryRequest)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Category = new TechMeter.Domain.Models.Category()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = addCategoryRequest.Name,
                    Description = addCategoryRequest.Description,
                    Courses = new List<Course>()
                };
                await _context.AddAsync(Category);
                await _context.SaveChangesAsync();
                var response = new AddCategoryResponse()
                {
                    Id = Category.Id,
                    Description = Category.Description,
                    Name = Category.Name,
                };
                await transaction.CommitAsync();
                return _responseHandler.Success(response, $"Category {Category.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<AddCategoryResponse>(ex.Message);
            }
        }

        public async Task<Domain.Shared.Bases.Response<string>> DeleteCategoryByIdAsync(string categoryId)
        {
            var category = await _context.Category.FindAsync(categoryId);
            if (category == null)
            {
                return _responseHandler.NotFound<string>("Category Not Found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Remove(category);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Success<string>(null, $"Category {category.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        public async Task<Domain.Shared.Bases.Response<List<GetCategoryDto>>> GetCategoriesAsync()
        {
            var categories = await _context.Category
               .AsNoTracking()
               .Include(b => b.Courses)
               .ThenInclude(b => b.Provider)
               .ToListAsync();

            var response = categories.Select(c => new GetCategoryDto()
            {
                Id = c.Id,
                Description = c.Description,
                Name = c.Name,
                courses = c.Courses.Select(b => new Application.DTO.Course.GetCourseResponse
                {
                    Id = b.Id,
                    Description = b.Description,
                    CategoryId = c.Id,
                    CourseProfileImageUrl = b.CourseProfileImageUrl,
                    ProviderId = b.ProviderId,
                    Title = b.Title,

                }).ToList()
            }).ToList();

            return _responseHandler.Success(response, $"All Categories returned successfully");
        }

        public async Task<Domain.Shared.Bases.Response<GetCategoryDto>> GetCategoryByIdAsync(string categoryId)
        {
            var category = await _context.Category
                .AsNoTracking()
                .Include(b => b.Courses)
                .ThenInclude(b => b.Provider)
                .FirstOrDefaultAsync(b => b.Id == categoryId);
            if (category == null)
            {
                return _responseHandler.NotFound<GetCategoryDto>("Category Not Found");
            }
            var response = new GetCategoryDto()
            {
                Id = categoryId,
                Description = category.Description,
                Name = category.Name,
                courses = category.Courses.Select(b => new Application.DTO.Course.GetCourseResponse
                {
                    Id = b.Id,
                    Description = b.Description,
                    CategoryId = categoryId,
                    CourseProfileImageUrl = b.CourseProfileImageUrl,
                    ProviderId = b.ProviderId,
                    Title = b.Title,

                }).ToList()
            };
            return _responseHandler.Success(response, $"Category {response.Name} returned successfully");
        }

        public async Task<Domain.Shared.Bases.Response<UpdateCategoryResponse>> UpdateCategoryAsync(string categoryId, UpdateCategoryRequest updateCategoryRequest)
        {
            var category = await _context.Category
               .FirstOrDefaultAsync(b => b.Id == categoryId);

            if (category == null)
            {
                return _responseHandler.NotFound<UpdateCategoryResponse>("Category Not Found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                category.Description = updateCategoryRequest.Description;
                category.Name = updateCategoryRequest.Name;
                await _context.SaveChangesAsync();

                var response = new UpdateCategoryResponse()
                {
                    Id = category.Id,
                    Description = category.Description,
                    Name = category.Name,

                };
                await transaction.CommitAsync();
                return _responseHandler.Success(response, $"Category {response.Name} updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<UpdateCategoryResponse>(ex.Message);
            }

        }
    }
}
