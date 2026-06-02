using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Interfaces.Payment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Payment.Command.PaymentIntent
{
    public class PaymentIntentCommandHandler(IPaymentService paymentService) : IRequestHandler<PaymentIntentCommand, Response<PaymentIntentResponse>>
    {
        public async Task<Response<PaymentIntentResponse>> Handle(PaymentIntentCommand request, CancellationToken cancellationToken)
        {
            return await paymentService.PaymentIntentService(request);
        }
    }
}
