using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.TwoFactorAuth.Command.Enable2FactorAuth
{
    public class Enable2FactorAuthCommandHandler(ResponseHandler responseHandler, UserManager<User> userManager) 
        : IRequestHandler<Enable2FactorAuthCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(Enable2FactorAuthCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.userId);
            if (user == null)
            {
                return responseHandler.NotFound<string>("User Is Not Found");
            }

            var IsEnabled = await userManager.SetTwoFactorEnabledAsync(user, true);
            if (!IsEnabled.Succeeded)
            {
                return responseHandler.BadRequest<string>(string.Join(",", IsEnabled.Errors.Select(b => b.Description)));
            }
            return responseHandler.Success(string.Empty, "Two Factor Authentication Enabled Successfully");
        }
    }
}
