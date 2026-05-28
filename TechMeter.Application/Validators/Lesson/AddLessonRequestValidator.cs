using FluentValidation;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Features.Lesson.Command.AddLesson;

namespace TechMeter.API.Validators
{
    public class AddLessonRequestValidator : AbstractValidator<AddLessonCommand>
    {
        public AddLessonRequestValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.request.Name) && b.request.LessonStream != null)
                .WithMessage("Lesson Name And LessonStream Is Required");
        }
    }
}
