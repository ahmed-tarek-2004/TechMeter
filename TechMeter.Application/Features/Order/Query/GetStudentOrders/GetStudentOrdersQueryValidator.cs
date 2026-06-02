using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.API.Validators.Order;

namespace TechMeter.Application.Features.Order.Query.GetStudentOrders
{
    public class GetStudentOrdersQueryValidator : AbstractValidator<GetStudentOrdersQuery>
    {
        public GetStudentOrdersQueryValidator()
        {
            RuleFor(x => x.GetOrders)
          .SetValidator(new GetOrdersValidation());
        }
    }
}
