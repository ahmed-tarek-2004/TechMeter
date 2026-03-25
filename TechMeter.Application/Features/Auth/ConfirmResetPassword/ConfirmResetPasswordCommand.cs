using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ConfirmResetPassword
{
    public sealed record ConfirmResetPasswordCommand(string userId, string otp) : IRequest<Response<VerifyResetPasswordResponse>>;
}