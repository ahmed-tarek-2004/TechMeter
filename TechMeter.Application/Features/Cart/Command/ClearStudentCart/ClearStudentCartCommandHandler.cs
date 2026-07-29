using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.ClearStudentCart
{
    public class ClearStudentCartCommandHandler(ICartService cartService) : IRequestHandler<ClearStudentCartCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ClearStudentCartCommand request, CancellationToken cancellationToken)
        {
            return await cartService.ClearStudentCartAsync(request.StudentId);
        }
    
    }
}
