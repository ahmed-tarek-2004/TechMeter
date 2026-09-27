using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.OAuth;

namespace TechMeter.Application.Interfaces.Services.OAuth
{
    public interface IExternalLoginService
    {
        Task<GetUserInfoResponse?> AuthenticateAsync(string provider,string token,CancellationToken cancellationToken);
    }
}
