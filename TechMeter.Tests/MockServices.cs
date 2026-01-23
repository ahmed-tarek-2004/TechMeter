using Castle.Core.Logging;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.IO.Pipelines;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using TechMeter.API.Controllers;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Application.Interfaces.TokenService;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.JwtSettings;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Tests.model;

namespace TechMeter.Tests
{
    public class MockServices
    {
        private readonly AccountController accountController;
        private readonly Mock<ILogger<AccountController>> _mockLogger;
        private readonly Mock<IAuthService> _mockAuth;
        private readonly Mock<IValidator<StudentRegisterRequestDto>> _mockStudentRegister;
        private readonly Mock<IValidator<LoginRequestDto>> _mockLogin;
        private readonly Mock<IValidator<Application.DTO.Auth.ResetPassword.ResetPasswordRequest>> _mockResetPasswordValidator;
        private readonly Mock<IValidator<ForgetPasswordRequest>> _mockForgetPasswordValidator;
        private readonly Mock<IValidator<ChangePassword>> _mockChangePasswordValidator;
        private readonly ResponseHandler _responseHandler;
        private readonly Mock<UserManager<User>> _mockUserMAnager;
        public MockServices()
        {
            _mockLogger = new();
            _mockAuth = new();
            _mockLogin = new();
            _responseHandler = new();
            _mockStudentRegister = new();
            _mockResetPasswordValidator = new();
            _mockChangePasswordValidator = new();
            _mockForgetPasswordValidator = new();
            //case I Would Use USerMAnager Must assign it to user Store;
            var setUp = new Mock<IUserStore<User>>();
            _mockUserMAnager = new Mock<UserManager<User>>(setUp.Object, null, null, null, null, null, null, null, null);
            
            
            accountController = new AccountController(_mockLogger.Object, _mockAuth.Object, 
                _mockStudentRegister.Object,_responseHandler,
                _mockLogin.Object,_mockChangePasswordValidator.Object,
                _mockResetPasswordValidator.Object,_mockForgetPasswordValidator.Object);
        }

        [Fact]
        public async Task Test_Account_Controller()
        {
            var loginRequest = new LoginRequestDto
            (
                 "ahed@gmail.com",
                 "password",
                 "123456"
            );
            var LoginResponse = new Response<LoginResponseDto>()
            {
                StatusCode = System.Net.HttpStatusCode.OK,
                Message = "LogedIn Successfully",
                Data = new LoginResponseDto()
                {
                    AccessToken = "token",
                    RefreshToken = "refresh"
                }
            };
            var validationResult = new ValidationResult();

            _mockLogin.Setup(b => b.ValidateAsync(loginRequest, default)).ReturnsAsync(new ValidationResult());
            _mockAuth.Setup(a => a.LoginAsync(loginRequest)).ReturnsAsync(LoginResponse);

            // Assert
            var result = await accountController.LoginAsync(loginRequest);
            //var actionResult = Assert.IsType<ObjectResult>(result.Result);
            //Assert.Equal(200, actionResult.StatusCode);
            var actionResult = Assert.IsType<ObjectResult>(result.Result);
            actionResult.StatusCode.Should().Be((int)HttpStatusCode.OK);


        }
        [Fact]
        public async Task Test_Failure_Account_Controller()
        {
            var loginRequest = new LoginRequestDto("invalid", "", "");
            var validationResult = new ValidationResult(new[]
            {
                new ValidationFailure(),
            });

            var ValidateResult = _mockLogin.Setup(b => b.ValidateAsync(loginRequest, default)).ReturnsAsync(validationResult);


            var result = await accountController.LoginAsync(loginRequest);
            var actionResult = Assert.IsType<ObjectResult>(result.Result);
            actionResult.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        }
    }
}
