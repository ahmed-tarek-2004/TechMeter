using AutoMapper;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Category.Command.AddCategory;

namespace TechMeter.API.Mapping.Category
{
    public class CategoryProfile:Profile
    {
        public CategoryProfile()
        {
            CreateMap<AddCategoryRequest, AddCategoryCommand>();
        }
    }
}
