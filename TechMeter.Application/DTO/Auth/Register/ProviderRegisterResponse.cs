using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.DTO.Auth.Register
{
    public class ProviderRegisterResponse(string Id, string UserName, string Email, string PhoneNumber,
        string Country, string? ProfilePhoto, Gender Gender, bool IsEmailConfirmed, string AccessToken,
        DateTime BirthDate, string BankAccount, string? Brief, int ExperienceYears, string RefreshToken);
}
