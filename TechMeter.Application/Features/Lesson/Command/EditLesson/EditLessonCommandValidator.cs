using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Lesson.Command.EditLesson
{
    public class EditLessonCommandValidator : AbstractValidator<EditLessonCommand>
    {
        public EditLessonCommandValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.EditLessonRequest.Name))
                .WithMessage("Lesson Name Is Required");
            RuleFor(b => b.EditLessonRequest.SectionId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("Section ID Is Required");
        }
    }
}
