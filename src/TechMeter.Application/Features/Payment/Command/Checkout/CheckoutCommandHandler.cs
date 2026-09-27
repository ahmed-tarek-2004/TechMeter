using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
//using TechMeter.Application.Interfaces.Payment;
using TechMeter.Application.Interfaces.Services.Payment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Payment.Command.Checkout
{
    public class CheckoutCommandHandler(IPaymentService paymentService) : IRequestHandler<CheckoutCommand, Response<PaymentResponse>>
    {
        public async Task<Response<PaymentResponse>> Handle(CheckoutCommand request, CancellationToken cancellationToken)
        {
            return await paymentService.CreateACheckOut(request);
        }
    }
}
