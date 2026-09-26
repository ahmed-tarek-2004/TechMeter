using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.EditSectionOrder
{
    public sealed record EditSectionOrderCommand(List<string> sectionsId, string courseId) : IRequest<Response<string>>;
}
