using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Logout
{
    public class LogoutCommandHandler(IAuthService authService) : IRequestHandler<LogoutCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            return await authService.LogoutAsync(request.User);
        }
    }
}
