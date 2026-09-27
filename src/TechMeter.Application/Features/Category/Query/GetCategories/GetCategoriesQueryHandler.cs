using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Query.GetCategories
{
    public class GetCategoriesQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<GetCategoriesQuery, Response<List<GetCategoryDto>>>
    {
        public async Task<Response<List<GetCategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            var response = await context.Category.AsNoTracking().Select(c => new GetCategoryDto()
            {
                Id = c.Id,
                Description = c.Description,
                Name = c.Name,
                courses = c.Courses.Select(b => new Application.DTO.Course.GetCourseResponse
                {
                    Id = b.Id,
                    Description = b.Description,
                    CategoryId = c.Id,
                    CourseProfileImageUrl = b.CourseProfileImageUrl,
                    ProviderId = b.ProviderId,
                    Title = b.Title,

                })
            }).ToListAsync();

            return responseHandler.Success(response, $"All Categories returned successfully");
        }
    }
}
