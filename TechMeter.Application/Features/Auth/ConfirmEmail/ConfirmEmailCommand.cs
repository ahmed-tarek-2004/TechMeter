using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ConfirmEmail
{
    public sealed record ConfirmEmailCommand(string userId, string otp) : IRequest<Response<string>>;
}