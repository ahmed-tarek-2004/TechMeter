using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Login.Command
{
    public class LoginCommandHandler(IAuthService authService) : IRequestHandler<LoginCommand, Response<LoginResponseDto>>
    {
        public async Task<Response<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            return await authService.LoginAsync(request.email,request.password,request.otp);
        }
    }
}
