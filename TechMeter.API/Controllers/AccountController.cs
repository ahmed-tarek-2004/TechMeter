using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Features.Auth.ChangePassword;
using TechMeter.Application.Features.Auth.ConfirmEmail;
using TechMeter.Application.Features.Auth.ConfirmResetPassword;
using TechMeter.Application.Features.Auth.ForgetPassword.Command;
using TechMeter.Application.Features.Auth.Login.Command;
using TechMeter.Application.Features.Auth.Logout;
using TechMeter.Application.Features.Auth.RefreshToken;
using TechMeter.Application.Features.Auth.Register.Command.Provider;
using TechMeter.Application.Features.Auth.Register.Command.Student;
using TechMeter.Application.Features.Auth.ResendOtp;
using TechMeter.Application.Features.Auth.ResetPassword;
using TechMeter.Application.Service.OTPService;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.UserTokens;
using TechMeter.Domain.Shared.Bases;
//using TechMeter.Infrastructure.Services.AuthService;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IMediator _mediator;

        public AccountController(ILogger<AccountController> logger,
              ResponseHandler responseHandler, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }


        //[HttpGet("Assmebly")]
        //public async Task<IActionResult> TestAssembly()
        //{
        //    Type t1 = typeof(ResendOtp);
        //    var type = _authService.GetType();
        //    _logger.LogInformation("type is :{type}", type);
        //    _logger.LogInformation("t1 is :{type}", t1);
        //    //_logger.LogInformation("FullName is :{type}", type.FullName);
        //    _logger.LogInformation("FullName is :{type}", type.FullName);
        //    _logger.LogInformation("Name is :{type}", type.Name);
        //    _logger.LogInformation("isPublic is :{type}", type.IsPublic);
        //    _logger.LogInformation("isInterface is :{type}", type.IsInterface);
        //    _logger.LogInformation("namespace is :{type}", type.Namespace);
        //    _logger.LogInformation("BaseType is :{type}", type.BaseType);
        //    _logger.LogInformation("interface is :{type}", type.GetInterfaces());
        //    _logger.LogInformation("T1 interface is :{t1.GetInterfaces()}", t1.GetInterfaces());
        //    _logger.LogInformation("is Value Type :{t1.IsValueType}", t1.IsValueType);



        //    return Ok();
        //}

        [HttpPost("student/register")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> RegisterAsStudent([FromForm] StudentRegisterRequest request)
        {
            var response = await _mediator.Send(new StudentRegisterCommand(request));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("provider/register")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> RegisterAsProvider([FromForm] ProviderRegisterRequest request)
        {
            var response = await _mediator.Send(new ProviderRegisterCommand(request));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("login")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> LoginAsync([FromBody] LoginRequestDto request)
        {
            var response = await _mediator.Send(new LoginCommand(request.email, request.password, request.otp));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<Response<ResetPasswordResponse>>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var response = await _mediator.Send(new ResetPasswordCommand(request.UserId, request.Token, request.Password, request.ConfirmPassword));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("forget-password")]
        public async Task<ActionResult<Response<ForgetPasswordResponse>>> ForgetPasswordAsync(ForgetPasswordRequest request)
        {
            var response = await _mediator.Send(new ForgetPasswordCommand(request.Email));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<Response<string>>> ChangePasswordAsync(ChangePasswordRequest request)
        {
            var response = await _mediator.Send(new ChangePasswordCommand(GetUserId(), request));
            return StatusCode((int)response.StatusCode, response);
        }



        [HttpPost("confirm-email")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyConfirmEmailAsync([FromBody] VerifyOtp request)
        {
            var result = await _mediator.Send(new ConfirmEmailCommand(request.userId, request.otp));
            return StatusCode((int)result.StatusCode, result);
        }
        [HttpPost("verify-reset-password")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyResetPasswordAsync([FromBody] VerifyOtp request)
        {
            var result = await _mediator.Send(new ConfirmResetPasswordCommand(request.userId, request.otp));
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("resend-otp")]
        [EnableRateLimiting("SendOtpPolicy")]
        public async Task<ActionResult<string>> ResendOtpAsync(ResendOtp request)
        {
            var response = await _mediator.Send(new ResendOtpCommand(request.Id));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("logout")]
        public async Task<ActionResult<string>> LogoutAsync()
        {
            var response = await _mediator.Send(new LogoutCommand(User));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {

            var newTokens = await _mediator.Send(new RefreshTokenCommand(refreshToken));

            return StatusCode((int)newTokens.StatusCode, newTokens);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        }
    }
}
