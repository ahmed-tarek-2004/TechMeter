using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Payment
{
    public class PaymentResponse
    {
        public string SessionUrl { get; set; }
        public string SessionId { get; set; }
    }
}
