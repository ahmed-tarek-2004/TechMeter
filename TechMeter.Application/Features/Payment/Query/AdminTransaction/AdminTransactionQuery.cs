using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Payment.Query.AdminTransaction
{
    public class AdminTransactionQuery : IRequest<Response<PaginatedList<TransactionResponse>>>
    {
        public string? providerId { get; set; }
        public DateTime? from { get; set; }
        public DateTime? to { get; set; }
        public int pageNumber { get; set; } = 1;
        public int pageSize { get; set; } = 10;
    }
}
