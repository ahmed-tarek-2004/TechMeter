using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Services.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.UpdateOrderStatus
{
    public class UpdateOrderStatusCommandHandler(IOrderService orderService) : IRequestHandler<UpdateOrderStatusCommand, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            return await orderService.UpdateOrderStatus(request.OrderId,request.Status);
        }
    }
}
