using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.Interfaces.Services.Email;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Login.Command
{
    public class LoginCommandHandler(ILogger<LoginCommandHandler> logger,
        UserManager<User> userManager,
        ResponseHandler responseHandler,
        IOTPService oTPService,
        IBackgroundJobService backgroundJobService,
        IConfiguration configuration,
        ITokenService tokenService) : IRequestHandler<LoginCommand, Response<LoginResponseDto>>
    {
        public async Task<Response<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            try
            {
                string otp = request.otp;
                var user = await userManager.FindByEmailAsync(request.email);
                if (user == null)
                {
                    logger.LogWarning("User with Email {request.email} : Not Found", request.email);
                    return responseHandler.NotFound<LoginResponseDto>($"User with Email {request.email} : Not Found");
                }
                bool checkPassword = await userManager.CheckPasswordAsync(user, request.password);
                if (!checkPassword)
                {
                    logger.LogWarning("Password is Incorrect");
                    return responseHandler.BadRequest<LoginResponseDto>("Password is Incorrect");
                }
                if (!user.EmailConfirmed)
                {
                    //otp = await oTPService.GenerateAndSetOTP(user.Id);
                    var confirmationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
                    var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmationToken));

                    var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:3000";

                    var confirmationLink = $"{frontendUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

                    backgroundJobService.Enqueue<IEmailService>(service => service.ConfirmEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, "30 minuts", confirmationLink, cancellationToken));

                    logger.LogInformation("confirmation email has been sent to {Email} for email confirmation", user.Email);
                    return responseHandler.BadRequest<LoginResponseDto>("Please verify your email. Confirmation email has been sent to your email.");
                }
                var roles = await userManager.GetRolesAsync(user);
                if (user.TwoFactorEnabled)
                {
                    if (string.IsNullOrEmpty(otp))
                    {
                        otp = await oTPService.GenerateAndSetOTP(user.Id);
                        backgroundJobService.Enqueue<IEmailService>(service => service.SendOtpEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, otp));
                        logger.LogInformation($"Otp Sent is : {request.otp}");

                        return responseHandler.Success(new LoginResponseDto { Id = user.Id }, "Oto Has sent via Email Plz Confirm");
                    }
                    else
                    {
                        var confirmOTP = await oTPService.ValidateOtp(request.otp, user.Id);
                        if (!confirmOTP)
                        {
                            return responseHandler.BadRequest<LoginResponseDto>("Enter A correct OTP");
                        }
                    }
                }

                var token = await tokenService.GenerateTokensAsync(user, user.Id);

               
                var respone = new LoginResponseDto()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    FullName = user.FullName ?? "",
                    PhotoUrl = user.ProfileUrl,
                    Role = roles.FirstOrDefault(),
                    AccessToken = token.AccessToken,
                    RefreshToken = token.RefreshToken,
                    requiresTwoFactor = user.TwoFactorEnabled,
                    IsEmailConfirmed = user.EmailConfirmed,
                };
                logger.LogInformation("LoggedIn Successfully");
                return responseHandler.Success<LoginResponseDto>(respone, "User Logined in Successfully");
            }
            catch (Exception ex)
            {
                logger.LogInformation(ex, ex.Message);
                return responseHandler.InternalServerError<LoginResponseDto>("Internal Server Error");
            }
        }
    }
}
