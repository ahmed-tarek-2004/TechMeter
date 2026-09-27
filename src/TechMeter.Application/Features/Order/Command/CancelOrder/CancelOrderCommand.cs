using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.CancelOrder
{
    public class CancelOrderCommand:IRequest<Response<string>>
    {
        public string OrderId { get; set; } = string.Empty;
    }
}
