using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Category.Command.AddCategory;
using TechMeter.Application.Features.Category.Command.UpdateCategory;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Services.Category
{
    public interface ICategoryService
    {
        Task<Response<GetCategoryDto>> GetCategoryByIdAsync(string categoryId);
        Task<Response<List<GetCategoryDto>>> GetCategoriesAsync();
        Task<Response<AddCategoryResponse>> AddCategoryAsync(string Name, string Description);
        Task<Response<UpdateCategoryResponse>> UpdateCategoryAsync(string Id, string Name, string Description);
        Task<Response<string>> DeleteCategoryByIdAsync(string categoryId);
    }
}
