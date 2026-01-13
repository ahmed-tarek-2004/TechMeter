using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Service.OTPService
{
    public class OTPService
    {
        private readonly StackExchange.Redis.IDatabase _redis;
        private readonly ILogger<OTPService> _logger;
        public OTPService(IConnectionMultiplexer redis, ILogger<OTPService> logger)
        {
            _redis = redis.GetDatabase();
            _logger = logger;
        }
        public async Task<string> GenerateAndSetOTP(string userId)
        {
            var OTP = GenerateOtp();
            _logger.LogInformation("Generate Otp is done");
            var result = await _redis.StringSetAsync(userId, OTP, TimeSpan.FromMinutes(2));
            if (result)
                _logger.LogInformation("OTP is Set For User : {userID} Successfully", userId);
            else
                _logger.LogInformation("Setting OTP Failed for User : {userId}", userId);
            return OTP;
        }
        public async Task<bool> ValidateOtp(string otp, string userId)
        {
            var Otp = await _redis.StringGetAsync(userId);
            if (string.IsNullOrEmpty(otp))
            {
                _logger.LogInformation("OTP Is Empty");
                return false;
            }
            if (Otp == otp)
            {
                _logger.LogInformation("OTP Matches , it is verified");

                var deleted = await _redis.KeyDeleteAsync(userId);
                if (deleted)
                {
                    _logger.LogInformation("Key After Validation is Deleted successfully");
                    return true;
                }
                else
                {
                    _logger.LogInformation("Failed To Delete Key After Validation");
                    return false;
                }
            }
            _logger.LogInformation("OTP does not Match , it is not verified");
            return false;

        }
        private string GenerateOtp()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            uint raw = BitConverter.ToUInt32(bytes, 0);
            uint otp = raw % 1_000_000;
            return otp.ToString("D6");
        }

    }
}
