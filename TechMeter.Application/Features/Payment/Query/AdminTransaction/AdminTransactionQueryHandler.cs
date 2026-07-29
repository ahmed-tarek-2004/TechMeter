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

namespace TechMeter.Application.Features.Payment.Query.AdminTransaction
{
    public class AdminTransactionQueryHandler(IPaymentService paymentService) : IRequestHandler<AdminTransactionQuery, Response<PaginatedList<TransactionResponse>>>
    {
        public async Task<Response<PaginatedList<TransactionResponse>>> Handle(AdminTransactionQuery request, CancellationToken cancellationToken)
        {
            return await paymentService.GetAllAdminTransaction(request.providerId, request.from, request.to, request.pageNumber, request.pageSize);
        }
    }
}
