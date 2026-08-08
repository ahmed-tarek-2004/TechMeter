using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Section;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Query.GetAllSection
{
    public class GetAllSectionQueryHandler(IApplicationDbContext context,ResponseHandler responseHandler) 
        : IRequestHandler<GetAllSectionQuery, TechMeter.Domain.Shared.Bases.Response<List<GetSectionResponse>>>
    {
        public async Task<Response<List<GetSectionResponse>>> Handle(GetAllSectionQuery request, CancellationToken cancellationToken)
        {
            var Sections = await context.Section.AsNoTracking().Where(b => b.CourseId == request.courseId).Select(b => new GetSectionResponse
            {
                Id = b.Id,
                Name = b.Name,
                courseId = b.CourseId,
                LessonCount = b.LessonCount
            }).ToListAsync();

            return responseHandler.Success(Sections, "Sections returned successfully");
        }
    }
}
