using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.API.Validators.Order;

namespace TechMeter.Application.Features.Order.Query.GetProviderOrders
{
    public class GetProviderOrdersQueryValidator : AbstractValidator<GetProviderOrdersQuery>
    {
        public GetProviderOrdersQueryValidator()
        {

            RuleFor(x => x.GetOrders)
           .SetValidator(new GetOrdersValidation());
        }
    }
}
