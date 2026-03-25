using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Section.Command.EditSection
{
    internal class EditSectionCommandValidator:AbstractValidator<EditSectionCommand>
    {
        public EditSectionCommandValidator() 
        {
            RuleFor(b => b)
               .Must(b => !string.IsNullOrEmpty(b.courseId) && !string.IsNullOrEmpty(b.sectionName))
               .WithMessage("CourseId and Name are required");
        }

    }
}
