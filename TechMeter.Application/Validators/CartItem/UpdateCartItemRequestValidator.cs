using FluentValidation;
using Microsoft.EntityFrameworkCore;
using TechMeter.Application.DTO.Cart;

namespace SmartStore.API.Validators.CartValidation
{
    public class UpdateCartItemRequestValidator : AbstractValidator<UpdateCartItemRequest>
    {
        public UpdateCartItemRequestValidator()
        {
            RuleFor(b => b.CartItemId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("CartItemId is required");
        }
    }
}
