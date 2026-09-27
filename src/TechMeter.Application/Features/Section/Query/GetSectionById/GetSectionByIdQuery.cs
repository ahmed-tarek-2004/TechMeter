using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Query.GetSectionById
{
    public sealed record GetSectionByIdQuery(string courseId, string sectionId) :IRequest<Response<GetSectionResponse>>;

}
