using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.Features.Auth.Register.Command.Student
{
    public class StudentRegisterCommandValidator : AbstractValidator<StudentRegisterCommand>
    {
        private readonly List<string> Extensions = [".png", ".jpg", ".jpeg"];
        public StudentRegisterCommandValidator()
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
                .WithMessage("PasswordConfirmed is required")
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
