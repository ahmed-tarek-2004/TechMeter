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
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.Category;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Query.GetCategoryById
{
    public class GetCategoryByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<GetCategoryByIdQuery, Response<GetCategoryDto>>
    {
        public async Task<Response<GetCategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var response = await context.Category
     .Where(c => c.Id == request.Id)
     .Select(c => new GetCategoryDto
     {
         Id = c.Id,
         Name = c.Name,
         Description = c.Description,
         courses = c.Courses.Select(course => new GetCourseResponse
         {
             Id = course.Id,
             Title = course.Title,
             Description = course.Description,
             CategoryId = course.CategoryId,
             ProviderId = course.ProviderId,
             CourseProfileImageUrl = course.CourseProfileImageUrl
         }).ToList()
     })
     .FirstOrDefaultAsync(cancellationToken);

            if (response is null)
            {
                return responseHandler.NotFound<GetCategoryDto>("Category Not Found");
            }

            return responseHandler.Success(
                response,
                $"Category {response.Name} returned successfully");
        }
    }
}
