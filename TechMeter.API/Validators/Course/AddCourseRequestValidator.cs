using FluentValidation;
using TechMeter.Application.DTO.Course;

namespace TechMeter.API.Validators
{
    public class AddCourseRequestValidator: AbstractValidator<AddCourseRequest>
    {
        public AddCourseRequestValidator() 
        {
            RuleFor(b => b)
               .Must(b=>!string.IsNullOrEmpty(b.CategoryId))
               .WithMessage("CategoryId is Requires");

            RuleFor(b => b.Title)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Title Is Required");

            RuleFor(b => b.Description)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Description Is Required");

        }

    }
}
