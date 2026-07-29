using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Services.OTP
{
    public interface IOTPService
    {
        public Task<string> GenerateAndSetOTP(string userId);
        public Task<bool> ValidateOtp(string otp, string userId);
    }
}
