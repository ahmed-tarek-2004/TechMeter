using FluentValidation;
using TechMeter.Application.DTO.Order;

namespace TechMeter.API.Validators.Order
{
    public class GetOrdersValidation : AbstractValidator<GetOrders>
    {
        public GetOrdersValidation()
        {
            RuleFor(b => b.PageNumber)
                .GreaterThan(0)
                .When(b => b.PageNumber != null)
                .WithMessage("Enter A Valid PageNumber");
            RuleFor(b => b.PageSize)
                .GreaterThan(0)
                .When(b => b.PageSize != null)
                .WithMessage("Enter A Valid PageSize");


        }
    }
}
