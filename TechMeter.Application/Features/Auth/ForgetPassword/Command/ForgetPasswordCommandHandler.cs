using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ForgetPassword.Command
{
    public class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, Response<ForgetPasswordResponse>>
    {
        private readonly IAuthService _authService;
        public ForgetPasswordCommandHandler(IAuthService authService)
        {
            _authService = authService;
        }
        public async Task<Response<ForgetPasswordResponse>> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
        {
            return await _authService.ForgetPassword(request.Email);
        }
    }
}
