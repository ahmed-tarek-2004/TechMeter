using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.DTO.Payment
{
    public class TransactionResponse
    {
        public string Id { get; set; }
        public string OrderId { get; set; }
        public string StudentId { get; set; }
        public decimal TotalPrice { get; set; }
        public string ProviderId { get; set; }
        public TransactionStatus Status { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
