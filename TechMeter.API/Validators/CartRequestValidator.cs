using FluentValidation;
using TechMeter.Application.DTO.Cart;

namespace SmartStore.API.Validators.CartValidation
{
    public class CartRequestValidator : AbstractValidator<CartRequest>
    {
        public CartRequestValidator()
        {
            RuleFor(x => x)
                .NotNull()
                .WithMessage("Request cannot be null");

            RuleFor(b => b.CourseId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("CourseId Is Required");

            RuleFor(b => b.UnitPrice)
                .NotNull().WithMessage("Unit price is required")
                .GreaterThan(0)
                .WithMessage("Unit Price Is Required");
        }

    }
}
