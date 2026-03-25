using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Query.GetSectionById
{
    public class GetSectionByIdQueryHandler(ISectionService sectionService) : IRequestHandler<GetSectionByIdQuery, Response<GetSectionResponse>>
    {
        public async Task<Response<GetSectionResponse>> Handle(GetSectionByIdQuery request, CancellationToken cancellationToken)
        {
            return await sectionService.GetSectionDetailedByIdAsync(request.courseId, request.sectionId);
        }
    }
}
