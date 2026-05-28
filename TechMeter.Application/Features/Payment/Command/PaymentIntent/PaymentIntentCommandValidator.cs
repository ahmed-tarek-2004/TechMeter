using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Payment.Command.PaymentIntent
{
    public class PaymentIntentCommandValidator:AbstractValidator<PaymentIntentCommand>
    {
        public PaymentIntentCommandValidator()
        {
            RuleFor(b => b)
                    .Must(b => !string.IsNullOrEmpty(b.orderId))
                    .WithMessage("Order Id Is Required");

            RuleFor(b => b)
                    .Must(b => !string.IsNullOrEmpty(b.currency))
                    .WithMessage("Currency Is Required");
        }
    }
}
