using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
        UserManager<User> userManager, ILogger<ConfirmEmailCommandHandler> logger,
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

                var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.token));
                var isValid = await userManager.ConfirmEmailAsync(user, decodedToken);
                if (!isValid.Succeeded)
                {
                    return responseHandler.BadRequest<string>("Token is not Correct");
                }
                user.EmailConfirmed = true;
                await userManager.UpdateAsync(user);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "Email is confirmed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while confirming email for user with ID {UserId}.", request.userId);
                return responseHandler.InternalServerError<string>("internal server Error");
            }
        }
    }
}
