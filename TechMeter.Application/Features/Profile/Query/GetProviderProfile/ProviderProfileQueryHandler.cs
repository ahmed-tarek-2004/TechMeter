using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetProviderProfile
{
    public class ProviderProfileQueryHandler(IProfileService profileService) : IRequestHandler<ProviderProfileQuery, Response<GetProviderProfileInfoResponse>>
    {
        public async Task<Response<GetProviderProfileInfoResponse>> Handle(ProviderProfileQuery request, CancellationToken cancellationToken)
        {
            return await profileService.GetProviderInfoResponseAsync(request.Id);
        }
    }
}
