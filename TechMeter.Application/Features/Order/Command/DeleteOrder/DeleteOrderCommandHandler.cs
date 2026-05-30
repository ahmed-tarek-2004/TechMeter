using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.DeleteOrder
{
    public class DeleteOrderCommandHandler(IOrderService orderService) : IRequestHandler<DeleteOrderCommand, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
        {
            return await orderService.DeleteOrderByProviderOrAdmin(request.OrderId);
        }
    }
}
