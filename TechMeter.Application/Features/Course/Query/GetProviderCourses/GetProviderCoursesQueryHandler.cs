using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetProviderCourses
{
    public class GetProviderCoursesQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) 
        : IRequestHandler<GetProviderCoursesQuery, Domain.Shared.Bases.Response<List<DTO.Course.GetCourseResponse>>>
    {
        public async Task<Domain.Shared.Bases.Response<List<DTO.Course.GetCourseResponse>>> Handle(GetProviderCoursesQuery request, CancellationToken cancellationToken)
        {
            var provider = await context.Provider.FindAsync(request.Id);
            if (provider == null)
            {
                return responseHandler.NotFound<List<GetCourseResponse>>("Provider is not found");
            }
            var coursesResponse = await context.Course.Where(b => b.ProviderId == request.Id).Select(b => new GetCourseResponse()
            {
                Id = b.Id,
                CategoryId = b.CategoryId,
                ProviderId = b.ProviderId,
                Description = b.Description,
                Title = b.Title,
                Price = b.Price,
                Currency = b.Currency
            }).ToListAsync();
            return responseHandler.Success(coursesResponse, "Courses returned successfully");
        }
    }
}
