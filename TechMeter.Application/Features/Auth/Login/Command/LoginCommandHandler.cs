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
    public class LoginCommandHandler : IRequestHandler<LoginCommand, Response<LoginResponseDto>>
    {
        private readonly IAuthService _authService;
        public LoginCommandHandler (IAuthService authService)
        {
            _authService = authService;
        }
        public async Task<Response<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            return await _authService.LoginAsync(request);
        }
    }
}
