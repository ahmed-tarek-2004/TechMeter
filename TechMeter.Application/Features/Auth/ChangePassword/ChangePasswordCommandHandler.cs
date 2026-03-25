using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ChangePassword
{
    public class ChangePasswordCommandHandler(IAuthService authService) : IRequestHandler<ChangePasswordCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            return await authService.ChangePasswordAsync(request);
        }
    }
}
