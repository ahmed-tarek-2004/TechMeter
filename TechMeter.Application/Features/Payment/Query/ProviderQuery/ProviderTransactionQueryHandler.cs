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

namespace TechMeter.Application.Features.Payment.Query.ProviderQuery
{
    public class ProviderTransactionQueryHandler(IPaymentService paymentService) : IRequestHandler<ProviderTransactionQuery, Response<PaginatedList<TransactionResponse>>>
    {
        public async Task<Response<PaginatedList<TransactionResponse>>> Handle(ProviderTransactionQuery request, CancellationToken cancellationToken)
        {
            return await paymentService.GetAllProviderTransaction(request.providerId, request.from, request.to, request.pageNumber, request.pageSize);
        }
    }
}
