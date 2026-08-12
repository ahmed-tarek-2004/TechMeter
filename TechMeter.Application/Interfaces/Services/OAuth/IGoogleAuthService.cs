using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.OAuth;

namespace TechMeter.Application.Interfaces.Services.OAuth
{
    public interface IGoogleAuthService
    {
        Task<GetUserInfoResponse>GetUserInfoAsync(string accessToken, IConfiguration configuration, CancellationToken cancellationToken = default);
    }
}
