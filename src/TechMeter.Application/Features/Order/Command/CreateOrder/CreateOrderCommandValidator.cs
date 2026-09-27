using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Order.Command.CreateOrder
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.StudentId).NotEmpty().WithMessage("StudentId is required.");
            RuleFor(x => x.StudentId).NotNull().WithMessage("StudnetId is required.");
        }
    }
}
