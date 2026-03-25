using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Query.GetAllSection
{
    public class GetAllSectionQueryHandler(ISectionService sectionService) : IRequestHandler<GetAllSectionQuery, TechMeter.Domain.Shared.Bases.Response<List<GetSectionResponse>>>
    {
        public async Task<Response<List<GetSectionResponse>>> Handle(GetAllSectionQuery request, CancellationToken cancellationToken)
        {
            return await sectionService.GetAllCourseSectionsAsync(request.courseId);
        }
    }
}
