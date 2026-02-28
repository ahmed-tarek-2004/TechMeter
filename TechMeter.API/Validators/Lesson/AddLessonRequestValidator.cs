using FluentValidation;
using TechMeter.Application.DTO.Lesson;

namespace TechMeter.API.Validators
{
    public class AddLessonRequestValidator : AbstractValidator<AddLessonRequest>
    {
        public AddLessonRequestValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.Name) && b.LessonStream != null)
                .WithMessage("Lesson Name And LessonStream Is Required");
        }
    }
}
