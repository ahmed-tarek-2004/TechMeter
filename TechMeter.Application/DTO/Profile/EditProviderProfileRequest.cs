using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.User
{
    public class EditProviderProfileRequest
    {
        public string? ProviderName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Country { get; set; }
        public string? BankAccount { get; set; }
        public string? Brief { get; set; }
        public int? ExperienceYears { get; set; }
        public IFormFile? profileImage { get; set; }
    }
}
