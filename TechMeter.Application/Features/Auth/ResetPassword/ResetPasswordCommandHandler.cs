using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.Services.Auth;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ResetPassword
{
    public class ResetPasswordCommandHandler(IAuthService authService) : IRequestHandler<ResetPasswordCommand, Response<ResetPasswordResponse>>
    {
        public async Task<Response<ResetPasswordResponse>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            return await authService.ResetPasswordAsync(request.UserId, request.Token, request.Password, request.ConfirmPassword);
        }
    }
}
