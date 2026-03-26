using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetProviderProfile
{
    public sealed record ProviderProfileQuery(string Id) : IRequest<Response<GetProviderProfileInfoResponse>>;
}
