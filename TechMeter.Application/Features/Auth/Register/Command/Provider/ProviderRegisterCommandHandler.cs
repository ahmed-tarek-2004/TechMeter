using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.Interfaces.Services.Auth;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Register.Command.Provider
{
    public class ProviderRegisterCommandHandler(IAuthService authService) : IRequestHandler<ProviderRegisterCommand, Response<ProviderRegisterResponse>>
    {
        public async Task<Response<ProviderRegisterResponse>> Handle(ProviderRegisterCommand request, CancellationToken cancellationToken)
        {
            return await authService.RegisterAsProviderAsync(request.ProviderRegisterRequest);
        }
    }
}
