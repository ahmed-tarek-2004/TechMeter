using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.StudentProfile.StudentProfileQuery
{
    public sealed record StudentProfileQuery(string Id):IRequest<Response<GetStudentProfileInfoResponse>>;
}
