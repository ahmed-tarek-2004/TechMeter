using FluentValidation;
using TechMeter.Application.DTO.Auth.ResetPassword;

namespace TechMeter.API.Validators
{
    public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
    {
        public ResetPasswordRequestValidator()
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
