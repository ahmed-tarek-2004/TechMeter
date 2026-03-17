using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Application.DTO.User
{
    public class GetProviderInfoResponse
    {
        public string Id { get; set; }
        public string ProviderName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public string BankAccount { get; set; }
        public string Brief { get; set; }
        public int ExperienceYears { get; set; }
        public string? ProfileUrl { get; set; }
    }
}
