using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class PaymentTransaction
    {
        public string Id {  get; set; }
        public string OrderId {  get; set; }
        public string StudentId {  get; set; }
        public decimal TotalPrice {  get; set; }
        public string ProviderId {  get; set; }
        public TransactionStatus Status {  get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public Student Student { get; set; }
        public Provider Provider { get; set; }
        public Order Order { get; set; }    

    }
}
