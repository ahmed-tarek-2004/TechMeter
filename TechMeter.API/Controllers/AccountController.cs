using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using System.Net;
using System.Reflection;
using System.Security.Claims;
//using TechMeter.API.Hubs;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Features.Auth.ChangePassword;
using TechMeter.Application.Features.Auth.ConfirmEmail;
using TechMeter.Application.Features.Auth.ForgetPassword.Command;
using TechMeter.Application.Features.Auth.Login.Command;
using TechMeter.Application.Features.Auth.Logout;
using TechMeter.Application.Features.Auth.Register.Command.Provider;
using TechMeter.Application.Features.Auth.Register.Command.Student;
using TechMeter.Application.Features.Auth.ResetPassword;
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
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFobWVkVGFyZWtaYWhlciIsIm5hbWVpZCI6ImE1YzdhMThlLTFhOTUtNDkzOS05YmQxLWQ4MTU1NjM1NzgyNiIsImVtYWlsIjoiaWdub3JlZG1lbWJlckBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IjAxMDMwMTg3MDEzIiwicm9sZSI6InN0dWRlbnQiLCJuYmYiOjE3NzU4NDAwMTYsImV4cCI6MTc3ODg2MDQxNiwiaWF0IjoxNzc1ODQwMDE2fQ.vqQY4sf0Ky--J0_P4ouLiLF0XbOhy67v0Ar5dh3h3p0
    public class AccountController : ControllerBase
    {
        //private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<AccountController> _logger;
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly ResponseHandler _responseHandler;

        public AccountController(ILogger<AccountController> logger, ResponseHandler responseHandler,
            IMapper mapper, IMediator mediator//, IHubContext<NotificationHub> hubContext
            )
        {
            //_hubContext = hubContext;
            _logger = logger;
            _responseHandler = responseHandler;
            _mapper = mapper;

            _mediator = mediator;
        }


        [HttpGet("Assmebly")]
        public async Task<IActionResult> TestAssembly()
        {

            //await _hubContext.Clients.All.SendAsync("fromassembly", "Test", "This is a test message from the server.");

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
            var command = _mapper.Map<ResetPasswordCommand>(request);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("forget-password")]
        public async Task<ActionResult<Response<ForgetPasswordResponse>>> ForgetPasswordAsync(ForgetPasswordRequest request)
        {

            var command = new ForgetPasswordCommand(request.Email);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<Response<string>>> ChangePasswordAsync(ChangePassword request)
        {
            var command = _mapper.Map<ChangePasswordCommand>(request);
            command.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }



        [HttpPost("confirm-email")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyConfirmEmailAsync([FromBody] VerifyOtp request)
        {
            var command = _mapper.Map<ConfirmEmailCommand>(request);
            var result = await _mediator.Send(command);
            return StatusCode((int)result.StatusCode, result);
        }
        [HttpPost("verify-reset-password")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> VertifyResetPasswordAsync([FromBody] VerifyOtp request)
        {
            var command = _mapper.Map<ConfirmEmailCommand>(request);
            var result = await _mediator.Send(command);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("resend-otp")]
        [EnableRateLimiting("SendOtpPolicy")]
        public async Task<ActionResult<string>> ResendOtpAsync(ResendOtp request)
        {
            var command = _mapper.Map<ResetPasswordCommand>(request);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("logout")]
        public async Task<ActionResult<string>> LogoutAsync()
        {
            var response = await _mediator.Send(new LogoutCommand(User));
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
