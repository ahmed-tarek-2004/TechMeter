using AutoMapper;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Category.Command.AddCategory;
using TechMeter.Application.Features.Category.Command.UpdateCategory;

namespace TechMeter.API.Mapping.Category
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<AddCategoryRequest, AddCategoryCommand>();
            CreateMap<UpdateCategoryRequest, UpdateCategoryCommand>()
                .ForMember(des => des.Id, opt => opt.Ignore());
        }
    }
}
