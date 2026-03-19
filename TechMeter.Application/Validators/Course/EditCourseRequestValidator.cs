using FluentValidation;
using TechMeter.Application.DTO.Course;

namespace TechMeter.API.Validators
{
    public class EditCourseRequestValidator : AbstractValidator<EditCourseRequest>
    {
        public EditCourseRequestValidator() 
        {
            RuleFor(b => b)
                .Must(b=>!string.IsNullOrEmpty(b.CategoryId))
                .WithMessage("CategoryId is Requires");
        }

    }
}
