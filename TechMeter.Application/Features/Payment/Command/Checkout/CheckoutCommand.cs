using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Payment.Command.Checkout
{
    public class CheckoutCommand:IRequest<Response<PaymentResponse>>
    {
        public string orderId { get; set; }
        public string currency { get; set; }
        public string studentId { get; set; }
    }
}
