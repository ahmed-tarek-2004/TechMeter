using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.EditSection
{
    public class EditSectionCommand:IRequest<Response<string>>
    {
        public string Id { get; set; }
        public string providerId { get; set; }
        public string sectionName { get; set; }
        public string courseId { get; set; }
    }
}
