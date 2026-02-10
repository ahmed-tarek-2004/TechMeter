using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;
using Microsoft.Extensions.Options;
using System.IO.Pipelines;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using TechMeter.Infrastructure.Adapters.JwtSettings;
using TechMeter.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace TechMeter.Application.Interfaces.TokenService
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _JwtSettings;
        private readonly UserManager<User> _userManager;
        private readonly SymmetricSecurityKey _symmetricSecurityKey;
        private readonly ApplicationDbContext _context;
        public TokenService(IOptions<JwtSettings> options, UserManager<User> userManager, ApplicationDbContext context)
        {
            _JwtSettings = options.Value;
            _userManager = userManager;
            _context = context;
            _symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_JwtSettings.SigningKey));
        }
        public async Task<string> GenerateAccessTokenAsync(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name,user.UserName),
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Email,user.Email),
                new Claim(ClaimTypes.MobilePhone,user.PhoneNumber)
            };

            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
            var cred = new SigningCredentials(_symmetricSecurityKey, SecurityAlgorithms.HmacSha256);
            var TokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                SigningCredentials = cred,
                Issuer = _JwtSettings.Issuer,
                Audience = _JwtSettings.Audience,
                Expires = DateTime.Now.AddDays(7),
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(TokenDescriptor);

            return tokenHandler.WriteToken(token);

        }

        public async Task<string> GenerateRefreshTokenAsync()
        {
            var number = new byte[64];
            using (var random = RandomNumberGenerator.Create())
            {
                random.GetBytes(number);
            }

            return Convert.ToBase64String(number);
        }

        public async Task<(string AccessToken, string RefreshToken)> GenerateTokensAsync(User user, string userId)
        {
            var AccessToken = await GenerateAccessTokenAsync(user);
            var RefreshTokoen = await GenerateRefreshTokenAsync();
            await SaveRefreshTokenAsync(RefreshTokoen, userId);
            return (AccessToken, RefreshTokoen);
        }

        public async Task SaveRefreshTokenAsync(string token, string userId)
        {
            await _context.UserRefreshTokens.AddAsync(new()
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = token,
                ExpiryDateUtc = DateTime.UtcNow.AddDays(7),
                IsUsed = false
            });

            await _context.SaveChangesAsync();
        }

        public async Task InValidateOldTokenAsync(string UserId)
        {
            var tokens = await _context.UserRefreshTokens.Where(u => u.UserId == UserId).ToListAsync();
            _context.UserRefreshTokens.RemoveRange(tokens);
            await _context.SaveChangesAsync();
        }


        public async Task<bool> ValidateRefreshTokenAsync(string refreshToken)
        {
            var userRefreshToken = await _context.UserRefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
            if (userRefreshToken == null) return false;
            return userRefreshToken.Token == refreshToken;
        }
    }
}
