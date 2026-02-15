using FluentValidation;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Validators
{
    public class ProviderRegisterRequestValidator:AbstractValidator<ProviderRegisterRequest>
    {
        private readonly List<string> Extensions = [".png", ".jpg", ".jpeg"];
        public ProviderRegisterRequestValidator()
        {
            RuleFor(b => b)
              .Must(b => !string.IsNullOrEmpty(b.Email) && !string.IsNullOrEmpty(b.UserName))
              .WithMessage("Email and UserName are required");

            RuleFor(x => x.Email)
              .EmailAddress()
              .When(b => !string.IsNullOrEmpty(b.Email));


            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.PhoneNumber))
                .WithMessage("PhoneNumber is required");

            RuleFor(b => b)
                .Must(b=>b.ExperienceYears>0)
                .WithMessage("ExperienceYears is required");

            RuleFor(b => b.PassworfConfirmed)
                .NotEmpty()
                .WithMessage("PasswordConfirmed is reuired")
                .Equal(b => b.Password)
                .WithMessage("Passwords do not match.");

            RuleFor(x => x.BirthDate)
                .NotNull()
                .WithMessage("Birthday is required");

            RuleFor(x => x.Country)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Country is required");


            RuleFor(x => x.Gender)
                .Must(x => x != Gender.none)
                .WithMessage("Gender is required");

            RuleFor(b => b.ProfilePhoto)
                .Must(b => Extensions.Contains(Path.GetExtension(b.FileName)))
                .When(b => b.ProfilePhoto != null);
        }
    }
}
