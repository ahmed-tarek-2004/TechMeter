using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StackExchange.Redis;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Application.Service.OTPService;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Services.AuthService;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAuthService _authService;
        private readonly IValidator<StudentRegisterRequest> _studentRegisterValidator;
        private readonly IValidator<LoginRequestDto> _loginRequestValidator;
        private readonly IValidator<ResetPasswordRequest> _resetPasswordValidator;
        private readonly IValidator<ForgetPasswordRequest> _forgetPasswordValidator;
        private readonly IValidator<ChangePassword> _changePasswordValidator;
        private readonly ResponseHandler _responseHandler;
        public AccountController(ILogger<AccountController> logger, IAuthService authService,
            IValidator<StudentRegisterRequest> studentRegisterValidator, ResponseHandler responseHandler
            , IValidator<LoginRequestDto> loginRequestValidator, IValidator<ChangePassword> changePasswordValidator,
            IValidator<ResetPasswordRequest> resetPasswordValidator, IValidator<ForgetPasswordRequest> forgetPasswordValidator)
        {
            _logger = logger;
            _authService = authService;
            _studentRegisterValidator = studentRegisterValidator;
            _responseHandler = responseHandler;
            _loginRequestValidator = loginRequestValidator;
            _changePasswordValidator = changePasswordValidator;
            _forgetPasswordValidator = forgetPasswordValidator;
            _resetPasswordValidator = resetPasswordValidator;
        }


        [HttpGet("Assmebly")]
        public async Task<IActionResult> TestAssembly()
        {
            Type t1 = typeof(ResendOtp);
            var type = _authService.GetType();
            _logger.LogInformation("type is :{type}", type);
            _logger.LogInformation("t1 is :{type}", t1);
            //_logger.LogInformation("FullName is :{type}", type.FullName);
            _logger.LogInformation("FullName is :{type}", type.FullName);
            _logger.LogInformation("Name is :{type}", type.Name);
            _logger.LogInformation("isPublic is :{type}", type.IsPublic);
            _logger.LogInformation("isInterface is :{type}", type.IsInterface);
            _logger.LogInformation("namespace is :{type}", type.Namespace);
            _logger.LogInformation("BaseType is :{type}", type.BaseType);
            _logger.LogInformation("interface is :{type}", type.GetInterfaces());
            _logger.LogInformation("T1 interface is :{t1.GetInterfaces()}", t1.GetInterfaces());
            _logger.LogInformation("is Value Type :{t1.IsValueType}", t1.IsValueType);

            
           
            return Ok();
        }

        [HttpPost("student/register")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> RegisterAsStudent([FromForm] StudentRegisterRequest request)
        {
            var validator = await _studentRegisterValidator.ValidateAsync(request);
            if (!validator.IsValid)
            {
                var error = string.Join(",", validator.Errors.Select(e => e.ErrorMessage).ToList());
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(error));
            }

            var response = await _authService.RegisterAsStudentAsync(request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("provider/register")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> RegisterAsProvider([FromForm] StudentRegisterRequest request)
        {
            var validator = await _studentRegisterValidator.ValidateAsync(request);
            if (!validator.IsValid)
            {
                var error = string.Join(",", validator.Errors.Select(e => e.ErrorMessage).ToList());
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(error));
            }

            var response = await _authService.RegisterAsStudentAsync(request);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("login")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> LoginAsync([FromBody] LoginRequestDto request)
        {
            var validator = await _loginRequestValidator.ValidateAsync(request);
            if (!validator.IsValid)
            {
                var error = string.Join(",", validator.Errors.Select(e => e.ErrorMessage).ToList());
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(error));
            }

            var response = await _authService.LoginAsync(request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<Response<ResetPasswordResponse>>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var validation = await _resetPasswordValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Errors = string.Join(',', validation.Errors.Select(e => e.ErrorMessage).ToList());
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(Errors));
            }
            var response = await _authService.ResetPasswordAsync(request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("forget-password")]
        public async Task<ActionResult<Response<ForgetPasswordResponse>>> ForgetPasswordAsync(ForgetPasswordRequest request)
        {
            var validation = await _forgetPasswordValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Errors = string.Join(',', validation.Errors.Select(e => e.ErrorMessage).ToList());
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(Errors));
            }
            var response = await _authService.ForgetPassword(request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<Response<string>>> ChangePasswordAsync(ChangePassword request)
        {
            var validation = await _changePasswordValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Errors = string.Join(',', validation.Errors.Select(e => e.ErrorMessage).ToList());
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(Errors));
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _authService.ChangePassword(userId, request);
            return StatusCode((int)response.StatusCode, response);
        }



        [HttpPost("verify-otp")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyOtpAsync([FromBody] VerifyOtp request)
        {
            if (!ModelState.IsValid)
                return StatusCode((int)_responseHandler.BadRequest<object>("Invalid input data.").StatusCode,
                    _responseHandler.BadRequest<object>("Invalid input data."));

            var result = await _authService.VerifyOtp(request);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("resend-otp")]
        [EnableRateLimiting("SendOtpPolicy")]
        public async Task<ActionResult<string>> ResendOtpAsync(ResendOtp request)
        {
            if (!ModelState.IsValid)
            {
                return StatusCode((int)_responseHandler.BadRequest<object>("Invalid input data.").StatusCode,
                   _responseHandler.BadRequest<object>("Invalid input data."));
            }
            var response = await _authService.ResponseOtp(request);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("logout")]
        public async Task<ActionResult<string>> LogoutAsync()
        {
            var response = await _authService.LogoutAsync(User);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
