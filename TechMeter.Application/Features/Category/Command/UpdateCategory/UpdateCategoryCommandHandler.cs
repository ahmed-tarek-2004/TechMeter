using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.UpdateCategory
{
    public class UpdateCategoryCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<UpdateCategoryCommand, Response<UpdateCategoryResponse>>
    {
        public async Task<Response<UpdateCategoryResponse>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await context.Category
            .FirstOrDefaultAsync(b => b.Id == request.id);

            if (category == null)
            {
                return responseHandler.NotFound<UpdateCategoryResponse>("Category Not Found");
            }
            try
            {
                category.Description = request.description;
                category.Name = request.name;
                await context.SaveChangesAsync(cancellationToken);

                var response = new UpdateCategoryResponse()
                {
                    Description = category.Description,
                    Name = category.Name,

                };
                return responseHandler.Success(response, $"Category {response.Name} updated successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<UpdateCategoryResponse>(ex.Message);
            }

        }
    }
}
