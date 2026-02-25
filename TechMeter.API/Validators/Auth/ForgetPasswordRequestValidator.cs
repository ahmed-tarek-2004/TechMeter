using FluentValidation;
using TechMeter.Application.DTO.Auth.ResetPassword;

namespace TechMeter.API.Validators
{
    public class ForgetPasswordRequestValidator : AbstractValidator<ForgetPasswordRequest>
    {
        public ForgetPasswordRequestValidator()
        {
            RuleFor(b => b.Email)
                .NotEmpty()
                .EmailAddress()
                .WithMessage("Email is required and not as email formar");



        }
    }
}
