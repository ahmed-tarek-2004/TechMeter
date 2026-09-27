using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Section.Command.AddSection
{
    public class AddSectionCommandValidator : AbstractValidator<AddSectionCommand>
    {
        public AddSectionCommandValidator() 
        {

            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.sectionName) && !string.IsNullOrEmpty(b.courseId))
                .WithMessage("SectionName and CourseId Are Required");
        }
    }
}
