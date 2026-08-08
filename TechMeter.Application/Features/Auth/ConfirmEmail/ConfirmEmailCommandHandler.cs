using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using static System.Net.WebRequestMethods;

namespace TechMeter.Application.Features.Auth.ConfirmEmail
{
    public class ConfirmEmailCommandHandler(IApplicationDbContext context,
        UserManager<User> userManager, IOTPService otpService, 
        ResponseHandler responseHandler) : IRequestHandler<ConfirmEmailCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
        {

            try
            {
                var user = await userManager.FindByIdAsync(request.userId);
                if (user == null)
                {
                    return responseHandler.BadRequest<string>("User is not found");
                }

                if (user.EmailConfirmed)
                    return responseHandler.Success<string>(null, "Email is already verified.");
                var isValid = await otpService.ValidateOtp(request.otp, request.userId);
                if (!isValid)
                {
                    return responseHandler.BadRequest<string>("Otp is not Correct");
                }
                user.EmailConfirmed = true;
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success<string>(null, "Email is confirmed successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("internal server Error");
            }
        }
    }
}
