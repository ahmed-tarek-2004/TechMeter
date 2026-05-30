using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.Features.Auth.Register.Command.Provider
{
    public class ProviderRegisterCommandValidator : AbstractValidator<ProviderRegisterCommand>
    {
        private readonly List<string> Extensions = [".png", ".jpg", ".jpeg"];
        public ProviderRegisterCommandValidator()
        {

            RuleFor(b => b.ProviderRegisterRequest)
                .NotEmpty()
                .WithMessage("Provider Register Request is required.")
                .DependentRules(()=>
                {
                    RuleFor(b => b.ProviderRegisterRequest)
                        .Must(b => !string.IsNullOrEmpty(b.Email) && !string.IsNullOrEmpty(b.UserName))
                        .WithMessage("Email and UserName are required");

                    RuleFor(x => x.ProviderRegisterRequest.Email)
                      .EmailAddress()
                      .When(b => !string.IsNullOrEmpty(b.ProviderRegisterRequest.Email));


                    RuleFor(b => b.ProviderRegisterRequest.PhoneNumber)
                        .Must(b => !string.IsNullOrEmpty(b))
                        .WithMessage("PhoneNumber is required");

                    RuleFor(b => b.ProviderRegisterRequest)
                        .Must(b => b.ExperienceYears > 0)
                        .WithMessage("ExperienceYears is required");

                    RuleFor(b => b.ProviderRegisterRequest.PassworfConfirmed)
                        .NotEmpty()
                        .WithMessage("PasswordConfirmed is required")
                        .Equal(b => b.ProviderRegisterRequest.Password)
                        .WithMessage("Passwords do not match.");

                    RuleFor(x => x.ProviderRegisterRequest.Country)
                        .Must(b => !string.IsNullOrEmpty(b))
                        .WithMessage("Country is required");


                    RuleFor(x => x.ProviderRegisterRequest.Gender)
                        .Must(x => x != Gender.none)
                        .WithMessage("Gender is required");

                    RuleFor(b => b.ProviderRegisterRequest.ProfilePhoto)
                        .Must(b => Extensions.Contains(Path.GetExtension(b.FileName)))
                        .When(b => b.ProviderRegisterRequest.ProfilePhoto != null);
                });
        }
    }
}
