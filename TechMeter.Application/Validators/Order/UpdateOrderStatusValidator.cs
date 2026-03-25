using FluentValidation;
using TechMeter.Application.DTO.Order;

namespace TechMeter.API.Validators.Order
{
    public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatus>
    {
        public UpdateOrderStatusValidator()
        {
            RuleFor(b => b.OrderId)
                .Must(o => !string.IsNullOrEmpty(o))
                .WithMessage("OrderId is required");


            RuleFor(b => b.Status)
                .Must(s => !string.IsNullOrEmpty(s))
                .WithMessage("Status is reuired");
        }
    }
}
