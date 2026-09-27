using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Webhook.Command
{
    public sealed record ConfirmWebhookCommand(string json, string stripeSignature) : IRequest<Response<object>>;

}
