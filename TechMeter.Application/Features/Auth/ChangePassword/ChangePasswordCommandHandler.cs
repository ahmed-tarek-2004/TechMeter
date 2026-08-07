using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ChangePassword
{
    public class ChangePasswordCommandHandler(UserManager<User> userManager, ITokenService tokenService, 
        ResponseHandler responseHandler) : IRequestHandler<ChangePasswordCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {
                return responseHandler.BadRequest<string>($"User With {request.UserId} is not found ");
            }

            var checkPassword = await userManager.CheckPasswordAsync(user, request.changePasswordRequest.CurrentPassword);
            if (!checkPassword)
            {
                return responseHandler.BadRequest<string>("Current password is incorrect");
            }

            var changePassword = await userManager.ChangePasswordAsync(user, request.changePasswordRequest.CurrentPassword, request.changePasswordRequest.NewPassword);
            if (!changePassword.Succeeded)
            {
                var Errors = string.Join(",", changePassword.Errors.Select(e => e.Description).ToList());
                return responseHandler.BadRequest<string>(Errors);
            }
            await tokenService.InValidateOldTokenAsync(request.UserId);

            return responseHandler.Success<string>(null, "Password changed successfully. Please login again.");

        }
    }
}
