using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Login.Command
{
    public record LoginCommand(string email, string password, string otp = ""): IRequest<Response<LoginResponseDto>>;
}
