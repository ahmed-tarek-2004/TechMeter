using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.EditSection
{
    public class EditSectionCommandHandler(ISectionService sectionService) : IRequestHandler<EditSectionCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditSectionCommand request, CancellationToken cancellationToken)
        {
            return await sectionService.EditSectionAsync(request);
        }
    }
}
