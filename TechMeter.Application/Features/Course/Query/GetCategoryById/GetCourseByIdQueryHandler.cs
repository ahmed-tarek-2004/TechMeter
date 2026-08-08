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

namespace TechMeter.Application.Features.Course.Query.GetCategoryById
{
    public class GetCourseByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetCourseByIdQuery, Response<GetCourseResponse>>
    {
        public async Task<Response<GetCourseResponse>> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
        {
            var course = await context.Course.AsNoTracking().FirstOrDefaultAsync(b => b.Id == request.Id);
            if (course == null)
            {
                return responseHandler.NotFound<GetCourseResponse>("Course is not found");
            }
            var response = new GetCourseResponse()
            {
                Id = course.Id,
                CategoryId = course.CategoryId,
                CourseProfileImageUrl = course.CourseProfileImageUrl,
                Description = course.Description,
                ProviderId = course.ProviderId,
                Title = course.Title,
                Price = course.Price,
                Currency = course.Currency,
            };

            return responseHandler.Success(response, "Course Returned Successfully");
        }
    }
}
