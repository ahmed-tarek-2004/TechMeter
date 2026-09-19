using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.TwoFactorAuth.Command.Disable2FactorAuth
{
    public class Disable2FactorAuthCommandHandler(ResponseHandler responseHandler, ILogger<Disable2FactorAuthCommandHandler> logger,
        UserManager<User> userManager)
        : IRequestHandler<Disable2FactorAuthCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(Disable2FactorAuthCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.userId);
            if (user == null)
            {
                logger.LogWarning("User is not found");
                return responseHandler.NotFound<string>("User Is Not Found");
            }

            var IsEnabled = await userManager.SetTwoFactorEnabledAsync(user, false);
            if (!IsEnabled.Succeeded)
            {
                var errors = string.Join(",", IsEnabled.Errors.Select(b => b.Description));
                logger.LogError(errors);
                return responseHandler.BadRequest<string>(errors);
            }
            return responseHandler.Success(string.Empty, "Two Factor Authentication Disabled Successfully");
        }
    }
}
