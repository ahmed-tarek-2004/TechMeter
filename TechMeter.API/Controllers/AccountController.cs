using AutoMapper;
using FluentValidation;
using MediatR;
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
using TechMeter.Application.Features.Auth.Login.Command;
using TechMeter.Application.Features.Auth.Register.Command.Provider;
using TechMeter.Application.Features.Auth.Register.Command.Student;
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
    //provider
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFobWVkWmFoZXIiLCJuYW1laWQiOiIwOTM0ZDk0My00OGNhLTQ3OTEtOGY4My0wNTI1MzFjOWJiODIiLCJlbWFpbCI6ImFobWVkdGFyZWs3NTgwQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDExNTg5MDU1ODkiLCJyb2xlIjoicHJvdmlkZXIiLCJuYmYiOjE3NzIyNzQ0MTIsImV4cCI6MTc3NTI5ODQxMiwiaWF0IjoxNzcyMjc0NDEyfQ.uHPlhh7soy84ZadWSVqpGNtv8XKr_BpCjIUS-iyvrUg
    //student
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFobWVkVGFyZWtaYWhlciIsIm5hbWVpZCI6ImE1YzdhMThlLTFhOTUtNDkzOS05YmQxLWQ4MTU1NjM1NzgyNiIsImVtYWlsIjoiaWdub3JlZG1lbWJlckBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IjAxMDMwMTg3MDEzIiwicm9sZSI6InN0dWRlbnQiLCJuYmYiOjE3NzIyNzQ3MDgsImV4cCI6MTc3NTI5ODcwOCwiaWF0IjoxNzcyMjc0NzA4fQ.HG7NJxfd4PA6BMUoFxSJC4xmGXuN6tFzvjFBVUSFJfk
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAuthService _authService;
        private readonly IValidator<StudentRegisterRequest> _studentRegisterValidator;
        private readonly IValidator<ProviderRegisterRequest> _providerRegisterValidator;
        private readonly IValidator<ResetPasswordRequest> _resetPasswordValidator;
        private readonly IValidator<ForgetPasswordRequest> _forgetPasswordValidator;
        private readonly IValidator<ChangePassword> _changePasswordValidator;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly ResponseHandler _responseHandler;

        public AccountController(ILogger<AccountController> logger, IAuthService authService,
            IValidator<StudentRegisterRequest> studentRegisterValidator, ResponseHandler responseHandler
            , IValidator<ChangePassword> changePasswordValidator, IMapper mapper, IMediator mediator,
            IValidator<ResetPasswordRequest> resetPasswordValidator, IValidator<ForgetPasswordRequest> forgetPasswordValidator,
            IValidator<ProviderRegisterRequest> providerRegisterValidator)
        {
            _logger = logger;
            _authService = authService;
            _studentRegisterValidator = studentRegisterValidator;
            _responseHandler = responseHandler;
            _changePasswordValidator = changePasswordValidator;
            _forgetPasswordValidator = forgetPasswordValidator;
            _resetPasswordValidator = resetPasswordValidator;
            _providerRegisterValidator = providerRegisterValidator;
            _mapper = mapper;
            _mediator = mediator;
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
            var command = _mapper.Map<StudentRegisterCommand>(request);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("provider/register")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> RegisterAsProvider([FromForm] ProviderRegisterRequest request)
        {
            var command = _mapper.Map<ProviderRegisterCommand>(request);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("login")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> LoginAsync([FromBody] LoginRequestDto request)
        {
            var command = _mapper.Map<LoginCommand>(request);
            var response = await _mediator.Send(command);
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



        [HttpPost("confirm-email")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyConfirmEmailAsync([FromBody] VerifyOtp request)
        {
            if (!ModelState.IsValid)
                return StatusCode((int)_responseHandler.BadRequest<object>("Invalid input data.").StatusCode,
                    _responseHandler.BadRequest<object>("Invalid input data."));

            var result = await _authService.VerifyConfirmEmailOtp(request);
            return StatusCode((int)result.StatusCode, result);
        }
        [HttpPost("verify-reset-password")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyResetPasswordAsync([FromBody] VerifyOtp request)
        {
            if (!ModelState.IsValid)
                return StatusCode((int)_responseHandler.BadRequest<object>("Invalid input data.").StatusCode,
                    _responseHandler.BadRequest<object>("Invalid input data."));

            var result = await _authService.VerifyResetPasswordOtp(request);
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
