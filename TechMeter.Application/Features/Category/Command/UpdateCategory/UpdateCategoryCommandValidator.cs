using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Category.Command.UpdateCategory
{
    public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
    {
        public UpdateCategoryCommandValidator()
        {
            RuleFor(b => b)
               .Must(b => !string.IsNullOrEmpty(b.Name) && !string.IsNullOrEmpty(b.Description))
               .WithMessage("Name and Description is Required");
        }
    }
}
