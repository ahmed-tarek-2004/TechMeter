using FluentValidation;
using TechMeter.Application.DTO.Rating;

namespace TechMeter.API.Validators.Rating
{
    public class DeleteAdminRatingRequestValidator:AbstractValidator<DeleteAdminRatingRequest>
    {
        public DeleteAdminRatingRequestValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.CourseId) && !string.IsNullOrEmpty(b.StudentId))
                .WithMessage("ClientId and CourseId is required");
        }

    }
}
