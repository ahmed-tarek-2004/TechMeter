using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models.Auth.Users
{
    public class Provider
    {
        public string Id { get; set; }
        public string BankAccount { get; set; }
        public string? Brief { get; set; }
        public int ExperienceYears { get; set; }
        public User User { get; set; }
        public ICollection<CertificatesUrl> certificatesUrls { get; set; }
        public ICollection<Course> Courses { get; set; }
        public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();

    }
}
