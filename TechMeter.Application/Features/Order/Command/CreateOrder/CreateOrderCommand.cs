using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.CreateOrder
{
    public sealed record CreateOrderCommand(string StudentId, string PaymentIntentId) : IRequest<Response<OrderResponse>>;
}
