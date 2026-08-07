using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.Services.Email;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ForgetPassword.Command
{
    public class ForgetPasswordCommandHandler(ResponseHandler responseHandler, UserManager<User> userManager,IOTPService otpService, 
        IBackgroundJobService backgroundJobService, ILogger<ForgetPasswordCommandHandler> logger) : IRequestHandler<ForgetPasswordCommand, Response<ForgetPasswordResponse>>
    {
        public async Task<Response<ForgetPasswordResponse>> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return responseHandler.BadRequest<ForgetPasswordResponse>($"User With Email {request} Is not Found");
            }
            try
            {
                var otp = await otpService.GenerateAndSetOTP(user.Id);
                backgroundJobService.Enqueue<IEmailService>(service => service.SendOtpEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, otp));
                logger.LogInformation("Email for forget Password is Sent");
                var response = new ForgetPasswordResponse()
                {
                    UserId = user.Id,
                };

                return responseHandler.Success(response, "Check Email For Otp");
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
                return responseHandler.InternalServerError<ForgetPasswordResponse>("Error Happend When Creating OTP Or Send Email");
            }
        }
    }
}
