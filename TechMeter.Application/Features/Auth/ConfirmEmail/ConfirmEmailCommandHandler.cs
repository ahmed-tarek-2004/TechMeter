using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ConfirmEmail
{
    public class ConfirmEmailCommandHandler(IAuthService authService) : IRequestHandler<ConfirmEmailCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
        {
            return await authService.VerifyConfirmEmailOtp(request);
        }
    }
}
