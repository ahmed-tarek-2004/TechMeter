using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Notification.Command.StoreNotification
{
    public class StoreUserTokensCommandHandler(IApplicationDbContext context,ResponseHandler responseHandler) : IRequestHandler<StoreUserTokensCommand, Response<bool>>
    {
        public async Task<Response<bool>> Handle(StoreUserTokensCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Users.AnyAsync(b => b.Id == request.userId);
            if (!user)
            {
                return responseHandler.NotFound<bool>("User is not found");
            }

            var userFcmTokenExists = await context.FcmUserTokens.AnyAsync(b => b.token == request.token && b.userId == request.userId);
            if (!userFcmTokenExists)
            {
                var FcmUserToken = new FcmUserTokens
                {
                    token = request.token,
                    userId = request.userId
                };
                await context.FcmUserTokens.AddAsync(FcmUserToken);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(true, "Token Stored Successfully");
            }
            return responseHandler.Success(true, "Token is Already Stored");
        }
    }
}
