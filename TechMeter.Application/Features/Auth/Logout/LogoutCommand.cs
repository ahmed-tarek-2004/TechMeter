using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Logout
{
    public sealed record LogoutCommand(ClaimsPrincipal User):IRequest<Response<string>>;
}
