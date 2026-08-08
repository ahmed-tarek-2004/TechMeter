using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Services.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Query.GetOrderById
{
    public class GetOrderByIdQueryHandler(IOrderService orderService) : IRequestHandler<GetOrderByIdQuery, Response<OrderResponse>>
    {
        public async Task<Response<OrderResponse>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            return await orderService.GetOrderByIdAsync(request.userId, request.orderId);
        }
    }
}
