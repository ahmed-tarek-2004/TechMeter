using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Rating.Command.EditStudentRating
{
    public class EditStudentRatingCommandValidator:AbstractValidator<EditStudentRatingCommand>
    {
        public EditStudentRatingCommandValidator() 
        {
            RuleFor(x => x.CourseId)
               .Must(x => !string.IsNullOrEmpty(x))
               .WithMessage("CourseId Is Requored");

            RuleFor(x => x.Rating)
                .InclusiveBetween(0, 5)
                .WithMessage("Rating is must be more than 1");

            RuleFor(x => x.Comment)
                .Must(x => !string.IsNullOrEmpty(x))
                .When(b => b.Rating == null || b.Rating < 0)
                .WithMessage("comment Or Rating is Required");
        }
    }
}
