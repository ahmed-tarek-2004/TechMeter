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
            RuleFor(b => b.StudentRegisterRequest)
                 .NotEmpty()
                 .WithMessage("Student Register Request is required.")
                 .DependentRules(() =>
                 {
                     RuleFor(b => b)
                 .Must(b => !string.IsNullOrEmpty(b.StudentRegisterRequest.Email))
                 .WithMessage("Email is required");

                     RuleFor(x => x.StudentRegisterRequest.Email)
                       .EmailAddress()
                       .When(b => !string.IsNullOrEmpty(b.StudentRegisterRequest.Email));

                     RuleFor(b => b)
                         .Must(b => !string.IsNullOrEmpty(b.StudentRegisterRequest.UserName))
                         .WithMessage("UserName is required");

                     RuleFor(b => b)
                         .Must(b => !string.IsNullOrEmpty(b.StudentRegisterRequest.PhoneNumber))
                         .WithMessage("PhoneNumber is required");

                     RuleFor(b => b)
                         .Must(b => !string.IsNullOrEmpty(b.StudentRegisterRequest.EducationLevel))
                         .WithMessage("Education Level  is required");

                     RuleFor(b => b.StudentRegisterRequest.PassworfConfirmed)
                         .NotEmpty()
                         .WithMessage("PasswordConfirmed is required")
                         .Equal(b => b.StudentRegisterRequest.Password)
                         .WithMessage("Passwords do not match.");

                     RuleFor(x => x.StudentRegisterRequest.BirthDate)
                         .NotNull()
                         .WithMessage("Birthday is required");

                     RuleFor(x => x.StudentRegisterRequest.Country)
                         .Must(b => !string.IsNullOrEmpty(b))
                         .WithMessage("Country is required");


                     RuleFor(x => x.StudentRegisterRequest.Gender)
                         .Must(x => x != Gender.none)
                         .WithMessage("Gender is required");

                     RuleFor(b => b.StudentRegisterRequest.ProfilePhoto)
                         .Must(b => Extensions.Contains(Path.GetExtension(b.FileName)))
                         .When(b => b.StudentRegisterRequest.ProfilePhoto != null);
                 })

                 ;
        }
    }
}
