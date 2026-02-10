using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class CertificatesUrl
    {
        public string Id { get; set; }
        public string CertificateUrl { get; set; }
        public string ProviderId { get; set; }
        public Provider Provider { get; set; }

    }
}
