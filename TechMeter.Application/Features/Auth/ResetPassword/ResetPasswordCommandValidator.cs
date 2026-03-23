using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.ResetPassword
{
    public class ResetPasswordCommandValidator:AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidator()
        {
            RuleFor(b => b.Password)
                .NotEmpty()
                .WithMessage("Password is required");

            RuleFor(b => b.token)
                .NotEmpty()
                .WithMessage("Token Is required");

            RuleFor(b => b.UserId)
                .NotEmpty()
                .WithMessage("User Id Is Reuired ");

            RuleFor(b => b.ConfirmPassword)
                .NotEmpty()
                .WithMessage("Confirm Password Is Required");
        }
    }
}
