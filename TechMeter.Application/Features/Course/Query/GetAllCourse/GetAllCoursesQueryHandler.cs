using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetAllCourse
{
    public class GetAllCoursesQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetAllCoursesQuery, Response<List<GetCourseResponse>>>
    {
        public async Task<Response<List<GetCourseResponse>>> Handle(GetAllCoursesQuery request, CancellationToken cancellationToken)
        {
            var response = await context.Course.Select(b => new GetCourseResponse
            {
                Id = b.Id,
                ProviderId = b.ProviderId,
                CategoryId = b.CategoryId,
                CourseProfileImageUrl = b.CourseProfileImageUrl,
                Description = b.Description,
                Title = b.Title,
                Price = b.Price,
                Currency = b.Currency
            }).ToListAsync();
            return responseHandler.Success(response, "All Courses Returned Successfully");
        }
    }
}
