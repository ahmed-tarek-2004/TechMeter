using MediatR;
using Microsoft.AspNetCore.Identity;
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
                    logger.LogWarning("Password is Incorrext");
                    return responseHandler.BadRequest<LoginResponseDto>("Password is InCorrect");
                }
                if (!user.EmailConfirmed)
                {
                    return responseHandler.BadRequest<LoginResponseDto>("verify Your Email");
                }
                if (string.IsNullOrEmpty(otp))
                {
                    otp = await oTPService.GenerateAndSetOTP(user.Id);
                    backgroundJobService.Enqueue<IEmailService>(service => service.SendOtpEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, request.otp)); logger.LogInformation($"Otp Sent is : {request.otp}");

                    return responseHandler.Success<LoginResponseDto>(new LoginResponseDto { Id = user.Id }, "Oto Has sent via Email Plz Confirm");
                }
                else
                {
                    var confirmOTP = await oTPService.ValidateOtp(request.otp, user.Id);
                    if (!confirmOTP)
                    {
                        return responseHandler.BadRequest<LoginResponseDto>("Enter A correct OTP");
                    }
                }
                var roles = await userManager.GetRolesAsync(user);
                var token = await tokenService.GenerateTokensAsync(user, user.Id);
                var respone = new LoginResponseDto()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    PhotoUrl = user.ProfileUrl,
                    Role = roles.FirstOrDefault(),
                    AccessToken = token.AccessToken,
                    RefreshToken = token.RefreshToken,
                    IsEmailConfirmed = user.EmailConfirmed,
                };
                logger.LogInformation("LoggedIn Successfully");
                return responseHandler.Success<LoginResponseDto>(respone, "User Logined in Successfully");
            }
            catch (Exception ex)
            {
                logger.LogInformation("Internal Server Error");
                return responseHandler.InternalServerError<LoginResponseDto>("Internal Server Error");
            }
        }
    }
}
