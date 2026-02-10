using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Application.DTO.Auth.Register
{
    public class ProviderRegisterRequest(string UserName, string Email, string PhoneNumber,
        string Password, string PassworfConfirmed, string Country, IFormFile? ProfilePhoto,
        Gender Gender, DateTime BirthDate, string BankAccount, string? Brief, int ExperienceYears);
}
