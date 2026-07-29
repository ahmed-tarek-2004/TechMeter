using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Query.GetProviderStudentCart
{
    public class GetProviderStudentCartCommandHandler(ICartService cartService) : IRequestHandler<GetProviderStudentCartCommand, Response<CartResponse>>
    {
        public async Task<Response<CartResponse>> Handle(GetProviderStudentCartCommand request, CancellationToken cancellationToken)
        {
            return await cartService.GetProviderCartAsync(request.ProviderId, request.StudentId);
        }
    }
}
