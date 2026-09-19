using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.TwoFactorAuth.Command.Disable2FactorAuth
{
    public class Disable2FactorAuthCommandHandler(ResponseHandler responseHandler, ILogger<Disable2FactorAuthCommandHandler> logger,
        IApplicationDbContext context)
        : IRequestHandler<Disable2FactorAuthCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(Disable2FactorAuthCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FindAsync(request.userId);
            if (user == null)
            {
                logger.LogWarning("User is not found");
                return responseHandler.NotFound<string>("User Is Not Found");
            }
            var rows = await context.Users
                .Where(b => b.Id == user.Id)
                .ExecuteUpdateAsync(b => b.SetProperty(b => b.TwoFactorEnabled, false));
            if (rows == 0)
            {
                return responseHandler.BadRequest<string>("An Error Occurred While Disable 2F Auth");
            }
            return responseHandler.Success(string.Empty, "Two Factor Authentication Disabled Successfully");
        }
    }
}
