using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ResendOtp
{
    public class ResendOtpCommandHandler(IAuthService authService) : IRequestHandler<ResendOtpCommand, TechMeter.Domain.Shared.Bases.Response<string>>
    {
        public async Task<Response<string>> Handle(ResendOtpCommand request, CancellationToken cancellationToken)
        {
            return await authService.ResponseOtp(request);
        }
    }
}
