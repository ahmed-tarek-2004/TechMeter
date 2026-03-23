using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.ChangePassword
{
    public class ChangePasswordCommandHandlerValidator:AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordCommandHandlerValidator() 
        {
            RuleFor(b => b.NewPassword)
               .NotEmpty()
               .WithMessage("New Password Is Required");
            RuleFor(b => b.ConfirmNewPassword)
                .NotEmpty()
                .WithMessage("Confirm Password is required")
                .Equal(b => b.NewPassword)
                .WithMessage("New Password must match confirmed password");
            RuleFor(b => b.CurrentPassword)
                .NotEmpty()
                .WithMessage("Current Password is required");
        }
    }
}
