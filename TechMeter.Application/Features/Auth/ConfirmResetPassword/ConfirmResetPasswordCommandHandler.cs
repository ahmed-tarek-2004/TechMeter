using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ConfirmResetPassword
{
    public class ConfirmResetPasswordCommandHandler(IAuthService authService) : IRequestHandler<ConfirmResetPasswordCommand, Response<VerifyResetPasswordResponse>>
    {
        public async Task<Response<VerifyResetPasswordResponse>> Handle(ConfirmResetPasswordCommand request, CancellationToken cancellationToken)
        {
            return await authService.VerifyResetPasswordOtp(request);
        }
    }
}
