using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

namespace TechMeter.Application.Features.Order.Query.GetAdminOrders
{
    public class GetAdminOrdersQueryValidator : AbstractValidator<GetAdminOrdersQuery>
    {
        public GetAdminOrdersQueryValidator()
        {
            RuleFor(b => b.GetOrders.PageNumber)
               .GreaterThan(0)
               .When(b => b.GetOrders.PageNumber != null)
               .WithMessage("Enter A Valid PageNumber");
            RuleFor(b => b.GetOrders.PageSize)
                .GreaterThan(0)
                .When(b => b.GetOrders.PageSize != null)
                .WithMessage("Enter A Valid PageSize");
        }
    }
}
