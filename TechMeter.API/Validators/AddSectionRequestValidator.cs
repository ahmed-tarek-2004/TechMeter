using FluentValidation;
using TechMeter.Application.DTO.Section;

namespace TechMeter.API.Validators
{
    public class AddSectionRequestValidator:AbstractValidator<AddSectionRequest>
    {
        public AddSectionRequestValidator() 
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.SectionName)&&!string.IsNullOrEmpty(b.courseId))
                .WithMessage("SectionName and CourseId Are Required");
        }
    }
}
