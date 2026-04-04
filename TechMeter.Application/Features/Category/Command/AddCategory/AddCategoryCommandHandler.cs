using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.AddCategory
{
    public class AddCategoryCommandHandler(ICategoryService categoryService) : IRequestHandler<AddCategoryCommand, Response<AddCategoryResponse>>
    {
        public async Task<Response<AddCategoryResponse>> Handle(AddCategoryCommand request, CancellationToken cancellationToken)
        {
            return await categoryService.AddCategoryAsync(request);
        }
    }
}
