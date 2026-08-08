using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.UserTokens;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.RefreshToken
{
    public sealed record RefreshTokenCommand(string refreshToken) : IRequest<Response<UserRefreshTokenResponse>>;
}
