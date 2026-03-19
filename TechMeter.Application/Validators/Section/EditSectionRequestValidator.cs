using FluentValidation;
using TechMeter.Application.DTO.Section;

namespace TechMeter.API.Validators
{
    public class EditSectionRequestValidator : AbstractValidator<EditSectionRequest>
    {
        public EditSectionRequestValidator()
        {

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.CourseId) && !string.IsNullOrEmpty(b.Name))
                .WithMessage("CourseId and Name are required");
        }
    }
}
