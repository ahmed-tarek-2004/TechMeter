using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Cart.Command.AddToCart
{
    internal class AddToCartCommandValidator:AbstractValidator<AddToCartCommand>
    {
        public AddToCartCommandValidator()
        {
            RuleFor(x => x)
                .NotNull()
                .WithMessage("Request cannot be null");
            RuleFor(b => b.CourseId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("CourseId Is Required");
            //RuleFor(b => b.UnitPrice)
            //    .NotNull().WithMessage("Unit price is required")
            //    .GreaterThan(0)
            //    .WithMessage("Unit Price Is Required");
        }
    }
}
