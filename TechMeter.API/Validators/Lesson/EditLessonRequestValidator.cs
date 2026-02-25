using FluentValidation;
using TechMeter.Application.DTO.Lesson;

namespace TechMeter.API.Validators
{
    public class EditLessonRequestValidator:AbstractValidator<EditLessonRequest>
    {
        public EditLessonRequestValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.Name) && !string.IsNullOrEmpty(b.LessonUrl))
                .WithMessage("Lesson Name And LessonUrl Is Required");
            RuleFor(b => b.SectionId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Section ID Is Required");
        }
    }
}
