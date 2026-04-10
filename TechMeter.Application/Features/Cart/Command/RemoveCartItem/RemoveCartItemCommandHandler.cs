using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.RemoveCartItem
{
    public class RemoveCartItemCommandHandler(ICartService cartService) : IRequestHandler<RemoveCartItemCommand, Response<string>>
    {
        
        public async Task<Response<string>> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
        {
            return await cartService.RemoveFromCartAsync(request.studentId, request.cartItemId);
        }
    }
}
