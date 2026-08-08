using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Logout
{
    public class LogoutCommandHandler(ILogger<LogoutCommandHandler> logger,
        UserManager<User> userManager, ITokenService tokenService, 
        ResponseHandler responseHandler) : IRequestHandler<LogoutCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = request.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return responseHandler.NotFound<string>("User Not Authenticated");
                }
                await tokenService.InValidateOldTokenAsync(userId);
                await userManager.UpdateSecurityStampAsync(await userManager.FindByIdAsync(userId));
                return responseHandler.Success<string>(null, "User Logout Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>($"An error occurred during logout: {ex.Message}");
            }
        }
    }
}
