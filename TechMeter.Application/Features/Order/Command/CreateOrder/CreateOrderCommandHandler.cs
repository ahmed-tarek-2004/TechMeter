using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.CreateOrder
{
    public class CreateOrderCommandHandler(IOrderService orderService) : IRequestHandler<CreateOrderCommand, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            return await orderService.CreateStudentOrder(request.StudentId,null);
        }
    }
}
