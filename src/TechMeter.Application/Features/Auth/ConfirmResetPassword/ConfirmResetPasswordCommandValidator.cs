using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.ConfirmResetPassword
{
    public class ConfirmResetPasswordCommandValidator : AbstractValidator<ConfirmResetPasswordCommand>
    {
        public ConfirmResetPasswordCommandValidator()
        {
            RuleFor(x => x.userId).NotEmpty().WithMessage("UserId is required.");
            RuleFor(x => x.otp).NotEmpty().WithMessage("OTP is required.");
        }
    }
}
