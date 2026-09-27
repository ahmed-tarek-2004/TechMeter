using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Query.GetStudentCart
{
    public sealed record GetStudentCartQuery(string StudentId) : IRequest<Response<CartResponse>>;
}
