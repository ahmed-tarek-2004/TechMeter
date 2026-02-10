using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Application.Interfaces.TokenService;
using TechMeter.Application.Service.OTPService;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Infrastructure.Services.AuthService;
using TechMeter.Tests.model;

namespace TechMeter.Tests
{
    public class InMemoryTesting
    {
        private readonly AuthService _authService;
        private readonly Mock<ITokenService> _tokenService;
        private readonly Mock<ILogger<AuthService>> _logger;
        private readonly Mock<IEmailService> _emailService;
        private readonly Mock<IImageUploading> _imageUploading;
        private readonly InMemoryDatabase _context;
        private readonly Mock<UserManager<User>> _userManager;
        private readonly Mock<IOTPService> _otpService;
        private readonly ResponseHandler _responseHandler;

        public InMemoryTesting()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().Options;
            _context = new InMemoryDatabase(options);
            _logger = new();
            _emailService = new();
            _imageUploading = new();
            _otpService = new();
            _tokenService = new();
            _responseHandler = new();
            var setUp = new Mock<IUserStore<User>>();
            _userManager = new Mock<UserManager<User>>(setUp.Object, null, null, null, null, null, null, null, null);

            _authService = new(_tokenService.Object, _logger.Object, _context, _userManager.Object, _imageUploading.Object, _responseHandler, _otpService.Object, _emailService.Object);

        }

        [Fact]
        public async Task TestLogin()
        {
            var loginRequest = new LoginRequestDto
            (
               "ahmed@gmail.com",
               "12345678",
               ""
            );
            var user = new User()
            {
                Id = Guid.NewGuid().ToString(),
                EmailConfirmed = true
            };
            _userManager.Setup(b => b.FindByEmailAsync(loginRequest.email)).ReturnsAsync(user);
            bool isvalid = true;
            _userManager
                .Setup(b => b.CheckPasswordAsync(user, loginRequest.password))
                .ReturnsAsync(isvalid);
            var otp = "123456";
            _otpService.Setup(b => b.GenerateAndSetOTP(user.Id)).ReturnsAsync(otp);

            _emailService.Setup(b => b.SendOtpEmailAsync(user, otp)).Returns(Task.CompletedTask);

            var result = await _authService.LoginAsync(loginRequest);
          
            Assert.Equal(HttpStatusCode.OK,result.StatusCode);

        }
    }
}
