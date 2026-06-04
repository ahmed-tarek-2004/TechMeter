using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.AddToCart
{
    public class AddToCartCommand:IRequest<Response<string>>
    {
        public string StudentId { get; set; }
        public string CourseId { get; set; }
    }
}
