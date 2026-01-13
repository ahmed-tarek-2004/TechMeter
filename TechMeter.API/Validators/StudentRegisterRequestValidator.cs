using System.IO;
using FluentValidation;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Validators
{
    public class StudentRegisterRequestValidator : AbstractValidator<StudentRegisterRequestDto>
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
                .WithMessage("User Name is required");

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.PhoneNumber))
                .WithMessage("PhoneNumber Name is required");

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.EducationLevel))
                .WithMessage("Education Level Name is required");

            RuleFor(b => b.PassworfConfirmed)
                .Equal(b => b.Password)
                .WithMessage("Passwords do not match.");

            RuleFor(x => x.BirthDate)
                .NotNull()
                .WithMessage("Birthday is required");

            RuleFor(x => x.Country)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Country is required");


            RuleFor(x => x.Gender)
                .Must(x=> x!=Gender.none)
                .WithMessage("Gender is required");

            RuleFor(b => b.ProfilePhoto)
                .Must(b => Extensions.Contains(Path.GetExtension(b.FileName)))
                .When(b => b.ProfilePhoto != null);

        }
    }
}
