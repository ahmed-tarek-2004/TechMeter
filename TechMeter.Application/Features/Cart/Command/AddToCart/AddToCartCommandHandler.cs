using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.AddToCart
{
    public class AddToCartCommandHandler(ICartService cartService) : IRequestHandler<AddToCartCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddToCartCommand request, CancellationToken cancellationToken)
        {
            return await cartService.AddToCartAsync(request.StudentId, request.CourseId);
        }
    }
}
