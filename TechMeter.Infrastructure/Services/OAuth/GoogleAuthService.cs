using Google.Apis.Auth;
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
    public class GoogleAuthService : IGoogleAuthService
    {
        public async Task<GetUserInfoResponse> GetUserInfoAsync(string accessToken, IConfiguration configuration
            , CancellationToken cancellationToken = default)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(accessToken,
          new GoogleJsonWebSignature.ValidationSettings
          {
              Audience = new[] { configuration["Authorization:Google:ClientId"] }
          });

                if (payload == null || string.IsNullOrEmpty(payload.Email))
                    throw new UnauthorizedAccessException("Invalid Google Token: Payload is null or missing email");

                //var s = payload.se
                return new GetUserInfoResponse
                {
                    name = payload.Name,
                    email = payload.Email,
                    picture = payload.Picture,
                    subjects = payload.Subject,
                    //birthday = payload.b
                };

            }
            catch (UnauthorizedAccessException ex)
            {
                throw new UnauthorizedAccessException("Invalid Google Token: " + ex.Message);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to validate Google Token: " + ex.Message, ex);
            }
        }
    }
}
