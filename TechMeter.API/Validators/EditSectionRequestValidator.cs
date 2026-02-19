using FluentValidation;
using TechMeter.Application.DTO.Section;

namespace TechMeter.API.Validators
{
    public class EditSectionRequestValidator : AbstractValidator<EditSectionRequest>
    {
        public EditSectionRequestValidator()
        {
            RuleFor(b => b.Id)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Id Is required");
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.CourseId) && !string.IsNullOrEmpty(b.Name));
        }
    }
}
