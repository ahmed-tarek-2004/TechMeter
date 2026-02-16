using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Category
{
    public interface ICategoryService
    {
        Task<Response<GetCategoryDto>>GetCategoryByIdAsync(string categoryId);
        Task<Response<List<GetCategoryDto>>>GetCategoriesAsync();
        Task<Response<AddCategoryResponse>>AddCategoryAsync(AddCategoryRequest addCategoryRequest);
        Task<Response<UpdateCategoryResponse>>UpdateCategoryAsync(string categoryId,UpdateCategoryRequest updateCategoryRequest);
        Task<Response<string>>DeleteCategoryByIdAsync(string categoryId);
    }
}
