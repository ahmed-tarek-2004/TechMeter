using FluentValidation;
using TechMeter.Application.DTO.WhishList;

namespace TechMeter.API.Validators
{
    public class AddToWishListRequestValidator : AbstractValidator<AddToWishListRequest>
    {
        public AddToWishListRequestValidator()
        {
            RuleFor(b => b.CourseId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("CourseId Is Required");
        }
    }
}
