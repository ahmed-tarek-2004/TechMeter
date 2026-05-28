using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandValidator:AbstractValidator<AddLessonCommand>
    {
        public AddLessonCommandValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.request.Name) && b.request.LessonStream != null)
                .WithMessage("Lesson Name And LessonStream Is Required");
        }
    }
}
