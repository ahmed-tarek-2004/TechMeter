using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Rating.Command.AddStudentRating
{
    public class AddStudentRatingCommandValidator:AbstractValidator<AddStudentRatingCommand>
    {
        public AddStudentRatingCommandValidator()
        {
            RuleFor(x => x.StudentId).NotEmpty().WithMessage("StudentId is required.");
            RuleFor(x => x.CourseId).NotEmpty().WithMessage("CourseId is required.");
            RuleFor(x => x.Rating).InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
            RuleFor(x => x.Comment).MaximumLength(500).WithMessage("Comment cannot exceed 500 characters.");
        }
    }
}
