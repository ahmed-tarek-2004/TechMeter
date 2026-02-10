using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Auth.Login
{
    public record LoginRequestDto(string email, string password, string otp = "");
}
