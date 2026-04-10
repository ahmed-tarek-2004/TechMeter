using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Query.GetProviderStudentCart
{
    public sealed record GetProviderStudentCartCommand(string ProviderId, string StudentId) : IRequest<Response<CartResponse>>;
}
