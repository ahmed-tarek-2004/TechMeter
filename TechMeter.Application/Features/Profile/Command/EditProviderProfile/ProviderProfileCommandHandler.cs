using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Features.Profile.Command.EditProviderProfile;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.EditPRoviderProfile
{
    public class ProviderProfileCommandHandler(IProfileService profileService) : IRequestHandler<ProviderProfileCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ProviderProfileCommand request, CancellationToken cancellationToken)
        {
            return await profileService.EditProviderProfileAsync(request.providerId, request.Request);
        }
    }
}
