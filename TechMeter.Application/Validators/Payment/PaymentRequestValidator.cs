using FluentValidation;
using TechMeter.Application.DTO.Payment;

namespace TechMeter.API.Validators.Payment
{
    public class PaymentRequestValidator : AbstractValidator<PaymentRequest>
    {
        public PaymentRequestValidator()
        {
            RuleFor(b => b)
                    .Must(b => !string.IsNullOrEmpty(b.OrderId))
                    .WithMessage("Order Id Is Required");

            RuleFor(b => b)
                    .Must(b => !string.IsNullOrEmpty(b.Currency))
                    .WithMessage("Currency Is Required");
        }
    }
}
