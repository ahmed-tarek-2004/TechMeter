using FluentValidation;
using TechMeter.Application.DTO.Rating;

namespace TechMeter.API.Validators.Rating
{
    public class AddStudentRatingRequestValidator:AbstractValidator<AddStudentRatingRequest>
    {
        public AddStudentRatingRequestValidator()
        {
            RuleFor(x => x.CourseId)
               .Must(x => !string.IsNullOrEmpty(x))
               .WithMessage("Course Is Requored");

            RuleFor(x => x.Rating)
                .NotNull()
                .WithMessage("Rating is Required")
                .InclusiveBetween(1, 5)
                .WithMessage("Rating is must be more than 1");


        }
    }
}
