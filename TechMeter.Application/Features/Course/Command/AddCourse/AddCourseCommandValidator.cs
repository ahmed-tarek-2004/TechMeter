using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Course.Command.AddCourse
{
    public class AddCourseCommandValidator : AbstractValidator<AddCourseCommand>
    {
        public AddCourseCommandValidator()
        {
            RuleFor(b=>b.addCourseRequest)
               .NotNull()
               .WithMessage("Name and Description are Required")
               .DependentRules(() =>
               {
                   RuleFor(b => b)
               .Must(b => !string.IsNullOrEmpty(b.addCourseRequest.CategoryId))
               .WithMessage("CategoryId is Requires");

                   RuleFor(b => b.addCourseRequest.Title)
                       .Must(b => !string.IsNullOrEmpty(b))
                       .WithMessage("Title Is Required");

                   RuleFor(b => b.addCourseRequest.Description)
                       .Must(b => !string.IsNullOrEmpty(b))
                       .WithMessage("Description Is Required");

                   RuleFor(b => b.addCourseRequest.Currency)
                       .Must(b => !string.IsNullOrEmpty(b))
                       .WithMessage("Currency Is Required");

                   RuleFor(b => b.addCourseRequest.Price)
                       .NotNull()
                       .NotEmpty()
                       .GreaterThanOrEqualTo(0)
                       .WithMessage("Price Is Required and Must be Greater Than 0");
               });
        }
    }
}
