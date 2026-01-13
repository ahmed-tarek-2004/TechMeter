using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Interfaces.AuthService;
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
        private readonly ResponseHandler _responseHandler;
        public AccountController(ILogger<AccountController> logger, IAuthService authService,
            IValidator<StudentRegisterRequestDto> studentRegisterValidator, ResponseHandler responseHandler
            , IValidator<LoginRequestDto> loginRequestValidator)
        {
            _logger = logger;
            _authService = authService;
            _studentRegisterValidator = studentRegisterValidator;
            _responseHandler = responseHandler;
            _loginRequestValidator = loginRequestValidator;
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
