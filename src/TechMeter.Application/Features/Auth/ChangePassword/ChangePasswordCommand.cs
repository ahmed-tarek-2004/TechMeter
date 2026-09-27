using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ChangePassword
{
    public sealed record ChangePasswordCommand(string UserId, ChangePasswordRequest changePasswordRequest) : IRequest<Response<string>>;
}
