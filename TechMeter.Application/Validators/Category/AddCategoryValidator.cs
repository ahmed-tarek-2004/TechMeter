using FluentValidation;
using TechMeter.Application.DTO.Category;

namespace TechMeter.API.Validators
{
    public class AddCategoryValidator
     : AbstractValidator<AddCategoryRequest>
    {
        public AddCategoryValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .Must(b=>!string.IsNullOrEmpty(b))
                .MaximumLength(100);

            RuleFor(x => x.Description)
                .Must(b => !string.IsNullOrEmpty(b))
                .MaximumLength(500);
        }
    }
}
