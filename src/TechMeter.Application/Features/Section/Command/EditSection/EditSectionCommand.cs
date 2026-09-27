using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.EditSection
{
    public class EditSectionCommand:IRequest<Response<string>>
    {
        public EditSectionRequest editSectionRequest {  get; set; }
        public string providerId { get; set; }
        public string Id { get; set; }
    }
}
