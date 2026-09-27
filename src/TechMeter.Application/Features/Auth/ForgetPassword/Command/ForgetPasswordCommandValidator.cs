using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.ForgetPassword.Command
{
    public class ForgetPasswordCommandValidator : AbstractValidator<ForgetPasswordCommand>
    {
        public ForgetPasswordCommandValidator()
        {
            RuleFor(b => b.Email)
                   .NotEmpty()
                   .EmailAddress()
                   .WithMessage("Email is required and not as email formar");

        }
    }
}
