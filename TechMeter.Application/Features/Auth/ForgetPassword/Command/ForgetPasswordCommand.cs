using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ForgetPassword.Command
{
    public sealed record ForgetPasswordCommand(string Email) : IRequest<Response<ForgetPasswordResponse>>;
    
}
