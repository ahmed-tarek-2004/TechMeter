using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Category.Command.AddCategory
{
    public class AddCategoryCommandValidator : AbstractValidator<AddCategoryCommand>
    {
        public AddCategoryCommandValidator()
        {
            RuleFor(x => x.Name)
               .NotEmpty()
               .Must(b => !string.IsNullOrEmpty(b))
               .MaximumLength(100);

            RuleFor(x => x.Description)
                .Must(b => !string.IsNullOrEmpty(b))
                .MaximumLength(500);
        }
    }
}
