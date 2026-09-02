using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.OAuth;
using TechMeter.Application.Interfaces.Services.OAuth;

namespace TechMeter.Infrastructure.Services.OAuth
{
    public class ExternalLoginService(IGoogleAuthService googleAuthService, IFacebookAuthService facebookAuthService) : IExternalLoginService
    {
        public async Task<GetUserInfoResponse?> AuthenticateAsync(string provider, string token, CancellationToken cancellationToken)
        {
            return provider.Trim().ToLower() switch
            {
                "facebook" =>
                    await facebookAuthService.GetUserInfoAsync(token, cancellationToken),

                "google" =>
                    await googleAuthService.GetUserInfoAsync(token, cancellationToken),

                _ => throw new ArgumentException("Unsupported provider")
            };
        }
    }
}
