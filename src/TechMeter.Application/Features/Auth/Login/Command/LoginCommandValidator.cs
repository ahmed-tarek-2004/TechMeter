using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.Login.Command
{
    public class LoginCommandValidator :AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(x => x)
             .Must(x => !string.IsNullOrEmpty(x.email))
             .WithMessage("Email is required.");

            RuleFor(x => x.email).EmailAddress()
                .When(b => !string.IsNullOrEmpty(b.email))
                .WithMessage("Email must be valid (e.g., user@example.com).");

            RuleFor(x => x.otp)
               .Length(6).When(x => !string.IsNullOrEmpty(x.otp))
               .WithMessage("OTP must be 6 characters long.");

            RuleFor(x => x.password)
              .NotEmpty().WithMessage("Password is required.")
              .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
              .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
              .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
              .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
              .Matches(@"[!@#$%^&*]").WithMessage("Password must contain at least one special character (!@#$%^&*).");
        }
    }
}
