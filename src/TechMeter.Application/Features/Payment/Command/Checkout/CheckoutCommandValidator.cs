using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Payment.Command.Checkout
{
    public class CheckoutCommandValidator:AbstractValidator<CheckoutCommand>
    {
        public CheckoutCommandValidator() 
        {
            //RuleFor(b => b)
            //       .Must(b => !string.IsNullOrEmpty(b.orderId))
            //       .WithMessage("Order Id Is Required");

            RuleFor(b => b)
                    .Must(b => !string.IsNullOrEmpty(b.currency))
                    .WithMessage("Currency Is Required");
        }
    }
}
