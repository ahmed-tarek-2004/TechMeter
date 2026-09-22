using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using Swashbuckle.AspNetCore.Annotations;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.DTO.Auth.ConfirmEmail;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.OAuth;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Features.Auth.ChangePassword;
using TechMeter.Application.Features.Auth.ConfirmEmail;
using TechMeter.Application.Features.Auth.ConfirmResetPassword;
using TechMeter.Application.Features.Auth.ExternalLogin;
using TechMeter.Application.Features.Auth.ForgetPassword.Command;
using TechMeter.Application.Features.Auth.Login.Command;
using TechMeter.Application.Features.Auth.Logout;
using TechMeter.Application.Features.Auth.RefreshToken;
using TechMeter.Application.Features.Auth.Register.Command.Provider;
using TechMeter.Application.Features.Auth.Register.Command.Student;
using TechMeter.Application.Features.Auth.ResendOtp;
using TechMeter.Application.Features.Auth.ResetPassword;
using TechMeter.Application.Features.Auth.TwoFactorAuth.Command.Disable2FactorAuth;
using TechMeter.Application.Features.Auth.TwoFactorAuth.Command.Enable2FactorAuth;
using TechMeter.Application.Service.OTPService;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.UserTokens;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Authentication & Accounts")]
    [Produces("application/json")]
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

        [HttpPost("student/register")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Register a new student account",
            Description = "Registers a new student account, assigns the student role, creates a personal cart, uploads avatar to Cloudinary, and sends an email confirmation link.",
            OperationId = "Account_RegisterStudent",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Student account created successfully", typeof(Response<StudentRegisterResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or email already exists", typeof(Response<StudentRegisterResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<StudentRegisterResponse>>> RegisterAsStudent([FromForm] StudentRegisterRequest request)
        {
            var response = await _mediator.Send(new StudentRegisterCommand(request));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("provider/register")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Register a new instructor / provider",
            Description = "Registers an instructor account with banking credentials, biography, certificate documents, and avatar upload to Cloudinary.",
            OperationId = "Account_RegisterProvider",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Provider account created successfully", typeof(Response<ProviderRegisterResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or email already exists", typeof(Response<ProviderRegisterResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<ProviderRegisterResponse>>> RegisterAsProvider([FromForm] ProviderRegisterRequest request)
        {
            var response = await _mediator.Send(new ProviderRegisterCommand(request));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("login")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Login with email and password",
            Description = "Authenticates user credentials. If 2FA is active, triggers an email OTP challenge. On successful authentication, returns JWT Access and Refresh tokens.",
            OperationId = "Account_Login",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "User authenticated or OTP challenge sent", typeof(Response<LoginResponseDto>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid credentials or unconfirmed email", typeof(Response<LoginResponseDto>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "User not found", typeof(Response<LoginResponseDto>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<LoginResponseDto>>> LoginAsync([FromBody] LoginRequestDto request)
        {
            var response = await _mediator.Send(new LoginCommand(request.email, request.password, request.otp));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("reset-password")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Reset password with verified token",
            Description = "Sets a new password for the user account using the verified reset token produced from the OTP verification step.",
            OperationId = "Account_ResetPassword",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Password has been successfully reset", typeof(Response<ResetPasswordResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid token or password requirements not met", typeof(Response<ResetPasswordResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<ResetPasswordResponse>>> ResetPasswordAsync([FromBody] ResetPasswordRequest request)
        {
            var response = await _mediator.Send(new ResetPasswordCommand(request.UserId, request.Token, request.Password, request.ConfirmPassword));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("forget-password")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Request password reset OTP",
            Description = "Generates a 6-digit OTP and emails it to the user's registered address to begin the password reset process.",
            OperationId = "Account_ForgetPassword",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Password reset OTP sent to email", typeof(Response<ForgetPasswordResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Account with specified email not found", typeof(Response<ForgetPasswordResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<ForgetPasswordResponse>>> ForgetPasswordAsync([FromBody] ForgetPasswordRequest request)
        {
            var response = await _mediator.Send(new ForgetPasswordCommand(request.Email));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("change-password")]
        [Authorize]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Change account password",
            Description = "Requires JWT Bearer authentication. Verifies the current password and updates the account with the new password.",
            OperationId = "Account_ChangePassword",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Password changed successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Incorrect current password or new password invalid", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
        {
            var response = await _mediator.Send(new ChangePasswordCommand(GetUserId(), request));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("confirm-email")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Confirm user email address",
            Description = "Verifies the student or instructor account using the confirmation token received via the verification email.",
            OperationId = "Account_ConfirmEmail",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Email confirmed successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid or expired confirmation token", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> VertifyConfirmEmailAsync([FromBody] ConfirmEmail request)
        {
            var result = await _mediator.Send(new ConfirmEmailCommand(request.userId, request.token));
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("verify-reset-password")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Verify password reset OTP",
            Description = "Validates the 6-digit OTP received via email and issues a secure password reset token.",
            OperationId = "Account_VerifyResetPassword",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "OTP verified, reset token generated", typeof(Response<VerifyResetPasswordResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid OTP code or unconfirmed email", typeof(Response<VerifyResetPasswordResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<VerifyResetPasswordResponse>>> VertifyForgrtPasswordAsync([FromBody] VerifyOtp request)
        {
            var result = await _mediator.Send(new ConfirmResetPasswordCommand(request.userId, request.otp));
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("resend-otp")]
        [EnableRateLimiting("SendOtpPolicy")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Resend OTP verification code",
            Description = "Generates and sends a new OTP code to the user's email. Enforces rate limiting (max 3 requests per minute).",
            OperationId = "Account_ResendOtp",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "New OTP sent successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "User not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded (maximum 3 requests/minute)")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> ResendOtpAsync([FromBody] ResendOtp request)
        {
            var response = await _mediator.Send(new ResendOtpCommand(request.Id));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("logout")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Logout current user",
            Description = "Requires JWT Bearer authorization. Revokes active refresh tokens and terminates the user's session.",
            OperationId = "Account_Logout",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Logged out successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> LogoutAsync()
        {
            var response = await _mediator.Send(new LogoutCommand(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("refresh-token")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Refresh JWT access token",
            Description = "Validates the active refresh token, invalidates it to prevent reuse, and issues a fresh Access and Refresh token pair.",
            OperationId = "Account_RefreshToken",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Token refreshed successfully", typeof(Response<UserRefreshTokenResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Refresh token required or malformed", typeof(Response<UserRefreshTokenResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Invalid, expired, or revoked refresh token", typeof(Response<UserRefreshTokenResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<UserRefreshTokenResponse>>> RefreshToken([FromBody] string refreshToken)
        {
            var newTokens = await _mediator.Send(new RefreshTokenCommand(refreshToken));
            return StatusCode((int)newTokens.StatusCode, newTokens);
        }

        [HttpPost("external-login")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "External OAuth login (Google / Facebook)",
            Description = "Validates third-party provider ID tokens, provisions a student account if new, and returns TechMeter JWT tokens.",
            OperationId = "Account_ExternalLogin",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "External authentication successful", typeof(Response<LoginResponseDto>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid external provider or token verification failed", typeof(Response<LoginResponseDto>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<LoginResponseDto>>> ExternalLogin([FromBody] ExternalLoginRequest request)
        {
            var newTokens = await _mediator.Send(new ExternalLoginCommand(request.idToken, request.provider));
            return StatusCode((int)newTokens.StatusCode, newTokens);
        }

        [HttpPost("enable-two-factor")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Enable Two-Factor Authentication (2FA)",
            Description = "Requires JWT Bearer authorization. Enables email-based 2FA challenge on subsequent login attempts.",
            OperationId = "Account_EnableTwoFactor",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "2FA enabled successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "2FA is already enabled or operation failed", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> EnabTwoFactor()
        {
            var newTokens = await _mediator.Send(new Enable2FactorAuthCommand(GetUserId()));
            return StatusCode((int)newTokens.StatusCode, newTokens);
        }

        [HttpPost("disable-two-factor")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Disable Two-Factor Authentication (2FA)",
            Description = "Requires JWT Bearer authorization. Disables email-based 2FA challenge for the user account.",
            OperationId = "Account_DisableTwoFactor",
            Tags = new[] { "Authentication & Accounts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "2FA disabled successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "2FA is not active or operation failed", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> DisableTwoFactor()
        {
            var newTokens = await _mediator.Send(new Disable2FactorAuthCommand(GetUserId()));
            return StatusCode((int)newTokens.StatusCode, newTokens);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        }
    }
}
