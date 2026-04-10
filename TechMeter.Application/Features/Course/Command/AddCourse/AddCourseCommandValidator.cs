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
            RuleFor(b => b)
              .Must(b => !string.IsNullOrEmpty(b.CategoryId))
              .WithMessage("CategoryId is Requires");

            RuleFor(b => b.Title)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Title Is Required");

            RuleFor(b => b.Description)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Description Is Required");

            RuleFor(b => b.Currency)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Currency Is Required");

            RuleFor(b => b.Price)
                .NotNull()
                .NotEmpty()
                .GreaterThanOrEqualTo(0)
                .WithMessage("Price Is Required and Must be Greater Than 0");
        }
    }
}
