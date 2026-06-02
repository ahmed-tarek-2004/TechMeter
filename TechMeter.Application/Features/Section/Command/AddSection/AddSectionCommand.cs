using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.AddSection
{
    public sealed record AddSectionCommand(string providerId, string courseId, string sectionName) : IRequest<Response<string>>;
   
}
