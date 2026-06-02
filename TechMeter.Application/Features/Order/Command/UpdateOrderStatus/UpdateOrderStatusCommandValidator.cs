using FluentValidation;
using FluentValidation.Validators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Order.Command.UpdateOrderStatus
{
    public class UpdateOrderStatusCommandValidator:AbstractValidator<UpdateOrderStatusCommand>
    {
        public UpdateOrderStatusCommandValidator()
        {
            RuleFor(b => b.Status)
                .Must(s => !string.IsNullOrEmpty(s))
                .WithMessage("Status is reuired");
        }

    }
}
