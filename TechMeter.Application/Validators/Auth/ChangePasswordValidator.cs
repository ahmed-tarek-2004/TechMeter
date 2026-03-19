using FluentValidation;
using TechMeter.Application.DTO.Auth.ResetPassword;

namespace TechMeter.API.Validators
{
    public class ChangePasswordValidator : AbstractValidator<ChangePassword>
    {
        public ChangePasswordValidator()
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
