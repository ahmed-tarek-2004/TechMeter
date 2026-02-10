using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.TokenService
{
    public interface ITokenService
    {
        public Task<string> GenerateAccessTokenAsync(User user);
        public Task<string> GenerateRefreshTokenAsync();
        public Task<(string AccessToken, string RefreshToken)> GenerateTokensAsync(User user, string userId);
        public Task<bool> ValidateRefreshTokenAsync(string refreshToken);
        public Task SaveRefreshTokenAsync(string token, string userID);
        public Task InValidateOldTokenAsync(string Id);

    }
}
