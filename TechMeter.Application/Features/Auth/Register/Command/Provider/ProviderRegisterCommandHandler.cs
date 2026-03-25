using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Register.Command.Provider
{
    public class ProviderRegisterCommandHandler : IRequestHandler<ProviderRegisterCommand, Response<ProviderRegisterResponse>>
    {
        private readonly IAuthService _authService;

        public ProviderRegisterCommandHandler(IAuthService authService)
        {
            _authService = authService;
        }
        public async Task<Response<ProviderRegisterResponse>> Handle(ProviderRegisterCommand request, CancellationToken cancellationToken)
        {
            return await _authService.RegisterAsProviderAsync(request);
        }
    }
}
