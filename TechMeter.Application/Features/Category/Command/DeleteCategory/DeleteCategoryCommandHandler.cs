using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.DeleteCategory
{
    public class DeleteCategoryCommandHandler(ICategoryService categoryService) : IRequestHandler<DeleteCategoryCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            return await categoryService.DeleteCategoryByIdAsync(request.categoryId);
        }
    }
}
