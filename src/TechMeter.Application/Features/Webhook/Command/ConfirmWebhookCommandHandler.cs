using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Payment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Webhook.Command
{
    public class ConfirmWebhookCommandHandler(IPaymentService paymentService) : IRequestHandler<ConfirmWebhookCommand, Response<object>>
    {
        public async Task<Response<object>> Handle(ConfirmWebhookCommand request, CancellationToken cancellationToken)
        {
            return await paymentService.HandleWebHookAsync(request.json, request.stripeSignature);
        }
    }
}
