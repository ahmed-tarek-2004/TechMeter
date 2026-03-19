using FluentValidation;
using TechMeter.Application.DTO.Category;

namespace TechMeter.API.Validators
{
    public class UpdateCategoryValidator:AbstractValidator<UpdateCategoryRequest>
    {
        public UpdateCategoryValidator()
        {
            RuleFor(b=>b)
                .Must(b => !string.IsNullOrEmpty(b.Name)&& !string.IsNullOrEmpty(b.Description))
                .WithMessage("Name and Description is Required");
        }
    }
}
