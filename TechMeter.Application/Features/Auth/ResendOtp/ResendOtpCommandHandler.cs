using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Email;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ResendOtp
{
    public class ResendOtpCommandHandler(UserManager<User> userManager, IOTPService otpService, 
        IBackgroundJobService backgroundJobService, ILogger<ResendOtpCommandHandler> logger, ResponseHandler responseHandler) : IRequestHandler<ResendOtpCommand, TechMeter.Domain.Shared.Bases.Response<string>>
    {
        public async Task<Response<string>> Handle(ResendOtpCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.Id);
            if (user == null)
            {
                return responseHandler.BadRequest<string>("user is not found");
            }
            if (user.EmailConfirmed)
            {
                return responseHandler.Success<string>(null, "Email is already verified.");
            }
            var otp = await otpService.GenerateAndSetOTP(user.Id);
            backgroundJobService.Enqueue<IEmailService>(service => service.SendOtpEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, otp)); logger.LogInformation("Email With {Otp} has ben Sent to {Email}", otp, user.Email);
            return responseHandler.Success<string>(null, "Email Has been Sent successfully");
        }
    }
}
