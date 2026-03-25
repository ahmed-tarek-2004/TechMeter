using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.DeleteSection
{
    public class DeleteSectionCommandHandler(ISectionService sectionService) : IRequestHandler<DeleteSectionCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteSectionCommand request, CancellationToken cancellationToken)
        {
            return await sectionService.DeleteSectionByIdAsync(request.providerId, request.courseId, request.courseId);
        }
    }
}
