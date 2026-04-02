using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.GetCategories
{
    public class GetCategoriesQueriesCommandHandler(ICategoryService categoryService) : IRequestHandler<GetCategoriesQuery, Response<List<GetCategoryDto>>>
    {
        public async Task<Response<List<GetCategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            return await categoryService.GetCategoriesAsync();
        }
    }
}
