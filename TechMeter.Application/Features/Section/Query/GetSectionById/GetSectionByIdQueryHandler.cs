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

namespace TechMeter.Application.Features.Section.Query.GetSectionById
{
    public class GetSectionByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetSectionByIdQuery, Response<GetSectionResponse>>
    {
        public async Task<Response<GetSectionResponse>> Handle(GetSectionByIdQuery request, CancellationToken cancellationToken)
        {
            var course = await context.Course.FirstOrDefaultAsync(b => b.Id == request.courseId);
            if (course == null)
            {
                return responseHandler.NotFound<GetSectionResponse>("Course Is Not Found");
            }
            var section = await context.Section.FirstOrDefaultAsync(b => b.Id == request.sectionId && b.CourseId == request.courseId);
            if (section == null)
            {
                return responseHandler.NotFound<GetSectionResponse>("Section is not found");
            }

            var response = new GetSectionResponse
            {
                courseId = request.courseId,
                Id = section.Id,
                Name = section.Name,
                LessonCount = section.LessonCount,
            };
            return responseHandler.Success(response, "Sections retuned successfully");
        }
    }
}
