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

namespace TechMeter.Application.Features.Category.Command.AddCategory
{
    public class AddCategoryCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<AddCategoryCommand, Response<AddCategoryResponse>>
    {
        public async Task<Response<AddCategoryResponse>> Handle(AddCategoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var Category = new TechMeter.Domain.Models.Category()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.Name,
                    Description = request.Description,
                    Courses = new List<Domain.Models.Course>()
                };
                await context.Category.AddAsync(Category);
                await context.SaveChangesAsync(cancellationToken);
                var response = new AddCategoryResponse()
                {
                    Id = Category.Id,
                    Description = Category.Description,
                    Name = Category.Name,
                };
                return responseHandler.Success(response, $"Category {Category.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<AddCategoryResponse>(ex.Message);
            }
        }
    }
}
