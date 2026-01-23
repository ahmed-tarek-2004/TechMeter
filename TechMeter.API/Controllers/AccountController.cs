using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAuthService _authService;
        private readonly IValidator<StudentRegisterRequestDto> _studentRegisterValidator;
        private readonly IValidator<LoginRequestDto> _loginRequestValidator;
        private readonly IValidator<ResetPasswordRequest> _resetPasswordValidator;
        private readonly IValidator<ForgetPasswordRequest> _forgetPasswordValidator;
        private readonly IValidator<ChangePassword> _changePasswordValidator;
        private readonly ResponseHandler _responseHandler;
        public AccountController(ILogger<AccountController> logger, IAuthService authService,
            IValidator<StudentRegisterRequestDto> studentRegisterValidator, ResponseHandler responseHandler
            , IValidator<LoginRequestDto> loginRequestValidator ,IValidator<ChangePassword> changePasswordValidator,
            IValidator<ResetPasswordRequest> resetPasswordValidator, IValidator<ForgetPasswordRequest> forgetPasswordValidator)
        {
            _logger = logger;
            _authService = authService;
            _studentRegisterValidator = studentRegisterValidator;
            _responseHandler = responseHandler;
            _loginRequestValidator = loginRequestValidator;
            _changePasswordValidator = changePasswordValidator;
            _forgetPasswordValidator = forgetPasswordValidator;
            _resetPasswordValidator= resetPasswordValidator;
        }
        [HttpPost("student/register")]
        public async Task<ActionResult<Response<StudentRegisterResponseDto>>> RegisterAsStudent([FromForm] StudentRegisterRequestDto request)
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
        public async Task<ActionResult<Response<StudentRegisterResponseDto>>> LoginAsync([FromBody] LoginRequestDto request)
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
        public async Task<ActionResult<Response<ResetPasswordResponse>>>ResetPasswordAsync(ResetPasswordRequest request)
        {
            var validation = await _resetPasswordValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Errors = string.Join(',',validation.Errors.Select(e => e.ErrorMessage).ToList());
                return _responseHandler.BadRequest<ResetPasswordResponse>(Errors);
            }
            var response = await _authService.ResetPasswordAsync(request);
            return StatusCode((int)response.StatusCode,response);
        }

        [HttpPost("forget-password")]
        public async Task<ActionResult<Response<ForgetPasswordResponse>>>ForgetPasswordAsync(ForgetPasswordRequest request)
        {
            var validation = await _forgetPasswordValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Errors = string.Join(',',validation.Errors.Select(e => e.ErrorMessage).ToList());
                return _responseHandler.BadRequest<ForgetPasswordResponse>(Errors);
            }
            var response = await _authService.ForgetPassword(request);
            return StatusCode((int)response.StatusCode,response);
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<Response<ForgetPasswordResponse>>>ChangePasswordAsync(ChangePassword request)
        {
            var validation = await _changePasswordValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Errors = string.Join(',',validation.Errors.Select(e => e.ErrorMessage).ToList());
                return _responseHandler.BadRequest<ForgetPasswordResponse>(Errors);
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _authService.ChangePassword(userId,request);
            return StatusCode((int)response.StatusCode,response);
        }



        [HttpPost("verify-otp")]
        public async Task<ActionResult<Response<StudentRegisterResponseDto>>> VertifyOtpAsync([FromBody] VerifyOtp request)
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
            if(!ModelState.IsValid)
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
