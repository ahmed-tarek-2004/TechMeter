using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ExternalLogin
{
    public sealed record ExternalLoginCommand(string idToken,string provider) : IRequest<Response<LoginResponseDto>>;
}
