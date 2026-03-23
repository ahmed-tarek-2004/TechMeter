using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ResetPassword
{
    public sealed record ResetPasswordCommand(string UserId, string token, string Password, string ConfirmPassword) : IRequest<Response<ResetPasswordResponse>>;
}
