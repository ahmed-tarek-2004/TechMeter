using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.DeleteSection
{
    public sealed record DeleteSectionCommand(string providerId , string courseId,string sectionId) : IRequest<Response<string>>;
}
