using MediatR;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ResetPassword
{
    public class ResetPasswordCommandHandler(UserManager<User> userManager, ITokenService tokenService, ResponseHandler responseHandler) : IRequestHandler<ResetPasswordCommand, Response<ResetPasswordResponse>>
    {
        public async Task<Response<ResetPasswordResponse>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {
                return responseHandler.BadRequest<ResetPasswordResponse>($"User With Id {request.UserId} Is not Found");
            }
            //var IsValid = await otpService.ValidateOtp(request.OTP, user.Id);
            //if (!IsValid)
            //{
            //    responseHandler.BadRequest<ResetPasswordResponse>("Otp IS Wrong");
            //}
            //var PasswordToken = await userManager.GeneratePasswordResetTokenAsync(user);
            var changePassword = await userManager.ResetPasswordAsync(user, request.Token, request.Password);
            if (!changePassword.Succeeded)
            {
                var Errors = string.Join(",", changePassword.Errors.Select(e => e.Description).ToList());
                responseHandler.Forbidden<ResetPasswordResponse>(Errors);
            }
            await tokenService.InValidateOldTokenAsync(user.Id);
            var roles = await userManager.GetRolesAsync(user);
            var respnse = new ResetPasswordResponse()
            {
                UserId = user.Id,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = roles.FirstOrDefault()
            };
            return responseHandler.Success(respnse, "Password Has been Reset Successfully");
            //throw new NotImplementedException();
        }
    }
}
