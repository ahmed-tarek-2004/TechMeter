using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Query.GetStudentCart
{
    public class GetStudentCartQueryHandler(ICartService cartService) : IRequestHandler<GetStudentCartQuery, Response<CartResponse>>
    {
        public async Task<Response<CartResponse>> Handle(GetStudentCartQuery request, CancellationToken cancellationToken)
        {
            return await cartService.GetCartAsync(request.StudentId);
        }
    }
}
