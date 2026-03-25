using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.AddSection
{
    public class AddSectionCommandHandler(ISectionService sectionService) : IRequestHandler<AddSectionCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddSectionCommand request, CancellationToken cancellationToken)
        {
            return await sectionService.AddSectionAsync(request);
        }
    }
}
