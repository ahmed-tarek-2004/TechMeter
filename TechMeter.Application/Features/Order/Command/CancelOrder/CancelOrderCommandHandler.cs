using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.CancelOrder
{
    public class CancelOrderCommandHandler(IOrderService orderService) : IRequestHandler<CancelOrderCommand, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
        {
            return await orderService.CancelOrderStatus(request.OrderId);
        }
    }
}
