using FluentValidation;
using TechMeter.Application.DTO.Lesson;

namespace TechMeter.API.Validators
{
    public class AddLessonRequestValidator : AbstractValidator<AddLessonRequest>
    {
        public AddLessonRequestValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.Name) && !string.IsNullOrEmpty(b.LessonUrl))
                .WithMessage("Lesson Name And LessonUrl Is Required");
        }
    }
}
