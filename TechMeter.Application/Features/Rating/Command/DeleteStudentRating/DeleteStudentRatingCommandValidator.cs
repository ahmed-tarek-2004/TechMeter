using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Rating.Command.DeleteStudentRating
{
    public class DeleteStudentRatingCommandValidator:AbstractValidator<DeleteStudentRatingCommand>
    {
        public DeleteStudentRatingCommandValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.StudentId) && !string.IsNullOrEmpty(b.CourseId))
                .WithMessage("StudentId and CourseId is required");
        }
    }
}
