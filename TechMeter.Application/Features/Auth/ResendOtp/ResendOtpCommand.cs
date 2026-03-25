using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ResendOtp
{
    public sealed record ResendOtpCommand(string Id) : IRequest<Response<string>>;
}
