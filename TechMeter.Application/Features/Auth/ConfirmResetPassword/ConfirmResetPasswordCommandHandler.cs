using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using static System.Net.WebRequestMethods;

namespace TechMeter.Application.Features.Auth.ConfirmResetPassword
{
    public class ConfirmResetPasswordCommandHandler(UserManager<User> userManager, IOTPService otpService, 
        ResponseHandler responseHandler) : IRequestHandler<ConfirmResetPasswordCommand, Response<VerifyResetPasswordResponse>>
    {
        public async Task<Response<VerifyResetPasswordResponse>> Handle(ConfirmResetPasswordCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await userManager.FindByIdAsync(request.userId);
                if (user == null)
                {
                    return responseHandler.BadRequest<VerifyResetPasswordResponse>("User is not found");
                }
                var isValid = await otpService.ValidateOtp(request.otp, request.userId);
                if (!isValid)
                {
                    return responseHandler.BadRequest<VerifyResetPasswordResponse>("Otp is not Correct");
                }
                if (!user.EmailConfirmed)
                {
                    return responseHandler.Forbidden<VerifyResetPasswordResponse>("Email not confirmed , you can't reset your password until confirm your email");
                }
                var Token = await userManager.GeneratePasswordResetTokenAsync(user);
                var response = new VerifyResetPasswordResponse
                {
                    token = Token,
                };
                return responseHandler.Success(response, "otp is verified");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<VerifyResetPasswordResponse>(ex.Message);
            }
        }
    }
}
