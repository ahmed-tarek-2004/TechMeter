using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Query.GetCategoryById
{
    public class GetCategoryByIdQueryHandler(ICategoryService categoryService) : IRequestHandler<GetCategoryByIdQuery, Response<GetCategoryDto>>
    {
        public async Task<Response<GetCategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            return await categoryService.GetCategoryByIdAsync(request.Id);
        }
    }
}
