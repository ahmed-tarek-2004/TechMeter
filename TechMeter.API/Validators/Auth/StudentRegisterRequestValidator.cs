using System.IO;
using FluentValidation;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Validators
{
    public class StudentRegisterRequestValidator : AbstractValidator<StudentRegisterRequest>
    {
        private readonly List<string> Extensions = [".png", ".jpg", ".jpeg"];
        public StudentRegisterRequestValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.Email))
                .WithMessage("Email is required");

            RuleFor(x => x.Email)
              .EmailAddress()
              .When(b => !string.IsNullOrEmpty(b.Email));

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.UserName))
                .WithMessage("UserName is required");

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.PhoneNumber))
                .WithMessage("PhoneNumber is required");

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.EducationLevel))
                .WithMessage("Education Level  is required");

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
