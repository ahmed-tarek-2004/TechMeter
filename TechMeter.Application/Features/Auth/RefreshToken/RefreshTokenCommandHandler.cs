using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.UserTokens;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.RefreshToken
{
    public class RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService,
        ResponseHandler responseHandler, ILogger<RefreshTokenCommandHandler> logger)
        : IRequestHandler<RefreshTokenCommand, Response<UserRefreshTokenResponse>>
    {
        public async Task<Response<UserRefreshTokenResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {

            if (string.IsNullOrWhiteSpace(request.refreshToken))
                return responseHandler.BadRequest<UserRefreshTokenResponse>("Refresh token is required");
            try
            {
                var userRefreshToken = await tokenService.ValidateRefreshTokenAsync(request.refreshToken);
                if (userRefreshToken == false)
                {
                    throw new SecurityTokenException("Invalid refresh token");
                }
                var refreshTokenEntity = await context.UserRefreshTokens.FirstOrDefaultAsync(t => t.Token == request.refreshToken);
                var user = await context.Users.FindAsync(refreshTokenEntity.UserId);
                if (user == null)
                {
                    throw new SecurityTokenException("Invalid user");
                }
                await tokenService.InValidateOldTokenAsync(user.Id);
                var userTokens = await tokenService.GenerateTokensAsync(user, user.Id);

                var respone = new UserRefreshTokenResponse
                {
                    AccessToken = userTokens.AccessToken,
                    RefreshToken = userTokens.RefreshToken,
                };
                return responseHandler.Success(respone, "User token refreshed succsessfully");
            }
            catch (SecurityTokenException ex)
            {
                logger.LogError(ex, "Security token error during refresh token process for token: {TokenSnippet}", request.refreshToken.Substring(0, Math.Min(8, request.refreshToken.Length)));
                return responseHandler.UnAuthorized<UserRefreshTokenResponse>(ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during refresh token process for token: {TokenSnippet}", request.refreshToken.Substring(0, Math.Min(8, request.refreshToken.Length)));
                var error = ex.InnerException?.Message ?? ex.Message;
                return responseHandler.BadRequest<UserRefreshTokenResponse>("UnexpectedError" + ": " + error);
            }
        }
    }
}
