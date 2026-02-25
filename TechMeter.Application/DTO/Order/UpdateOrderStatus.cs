using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Order
{
    public class UpdateOrderStatus
    {
        public string OrderId { get; set; }
        public string Status { get; set; }
    }
}
