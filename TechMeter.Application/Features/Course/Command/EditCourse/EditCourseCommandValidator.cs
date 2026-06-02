using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Course.Command.EditCourse
{
    public class EditCourseCommandValidator : AbstractValidator<EditCourseCommand>
    {
        public EditCourseCommandValidator() 
        {
            RuleFor(b => b)
               .Must(b => !string.IsNullOrEmpty(b.editCourseRequest.CategoryId))
               .WithMessage("CategoryId is Requires");
        }
    }
}