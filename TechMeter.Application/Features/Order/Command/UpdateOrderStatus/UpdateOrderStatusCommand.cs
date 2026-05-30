using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.UpdateOrderStatus
{
    public class UpdateOrderStatusCommand:IRequest<Response<OrderResponse>>
    {
        public string OrderId { get; set; }
        public string Status { get; set; }
    }
}
