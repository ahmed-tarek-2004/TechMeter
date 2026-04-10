using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.UpdateCategory
{
    public class UpdateCategoryCommandHandler(ICategoryService categoryService) : IRequestHandler<UpdateCategoryCommand, Response<UpdateCategoryResponse>>
    {
        public async Task<Response<UpdateCategoryResponse>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
