using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Payment
{
    public class PaymentRequest
    {
        public string CourseName { get; set; }
        //public string OrderId { get; set; }
        public string Currency { get; set; } = "usd";
        public decimal Price {  get; set; }
        //public string SuccessUrl { get; set; } = "https://amars-marvelous-site-305200.webflow.io/";
        //public string CancelUrl { get; set; } = "https://amars-fantabulous-site-16cb2e.webflow.io/";
    }
}
