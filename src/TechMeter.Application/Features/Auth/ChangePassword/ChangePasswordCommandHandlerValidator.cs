using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Auth.ChangePassword
{
    public class ChangePasswordCommandHandlerValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordCommandHandlerValidator()
        {
            RuleFor(b => b.UserId)
                .NotEmpty()
                .WithMessage("User Id is required");

            RuleFor(b => b.changePasswordRequest)
                .NotNull()
                .WithMessage("Change Password Request is required")
                .DependentRules(() =>
                {
                    RuleFor(b => b.changePasswordRequest.NewPassword)
                        .NotEmpty()
                        .WithMessage("New Password is required");

                    RuleFor(b => b.changePasswordRequest.ConfirmNewPassword)
                        .NotEmpty()
                        .WithMessage("Confirm Password is required")
                        .Equal(b => b.changePasswordRequest.NewPassword)
                        .WithMessage("New Password must match Confirm Password");

                    RuleFor(b => b.changePasswordRequest.CurrentPassword)
                        .NotEmpty()
                        .WithMessage("Current Password is required");
                });
        }
    }
}
