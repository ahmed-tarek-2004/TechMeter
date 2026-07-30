using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.Category;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.DeleteCategory
{
    public class DeleteCategoryCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<DeleteCategoryCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await context.Category.FindAsync(request.categoryId);
            if (category == null)
            {
                return responseHandler.NotFound<string>("Category Not Found");
            }
            try
            {
                context.Category.Remove(category);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success<string>(null, $"Category {category.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
