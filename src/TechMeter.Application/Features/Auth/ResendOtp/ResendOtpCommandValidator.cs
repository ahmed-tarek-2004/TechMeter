using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.ResendOtp
{
    public class ResendOtpCommandValidator:AbstractValidator<ResendOtpCommand>
    {
        public ResendOtpCommandValidator() 
        {
            RuleFor(b=>b.Id).NotEmpty().WithMessage("Id is required");
        }
    }
}
