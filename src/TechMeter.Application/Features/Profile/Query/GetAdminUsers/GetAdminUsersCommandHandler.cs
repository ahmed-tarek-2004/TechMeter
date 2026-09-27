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
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace TechMeter.Application.Features.Profile.Query.GetAdminUsers
{
    public class GetAdminUsersCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        UserManager<User> userManager, ILogger<GetAdminUsersCommandHandler> logger) :
        IRequestHandler<GetAdminUsersCommand, Response<PaginatedList<GetAdminUsersResponse>>>
    {
        public async Task<Response<PaginatedList<GetAdminUsersResponse>>> Handle(GetAdminUsersCommand request, CancellationToken cancellationToken)
        {
            var query = context.Users
                .AsNoTracking()
                .Where(u => u.Id != request.AdminId);

            if (!string.IsNullOrWhiteSpace(request.name))
            {
                logger.LogInformation("Start name Filter");
                query = query.Where(u =>
                    u.FullName.Contains(request.name) ||
                    u.UserName!.Contains(request.name));
            }

            if (request.Islocked.HasValue)
            {
                logger.LogInformation("Start islocked Filter");
                query = query.Where(u => !u.LockoutEnd.HasValue);
            }

            if (request.IsTwoFactorEnabled.HasValue)
            {
                logger.LogInformation("Start IsTwoFactorEnabled Filter");
                query = query.Where(u =>
                    u.TwoFactorEnabled == request.IsTwoFactorEnabled.Value);
            }

            if (!string.IsNullOrEmpty(request.role))
            {
                logger.LogInformation("Start Role Filter");
                query = query.Where(u =>
                    context.UserRoles.Any(ur =>
                        ur.UserId == u.Id &&
                        context.Roles.Any(r =>
                            r.Id == ur.RoleId &&
                            r.Name == request.role)));
            }

            var users = query.Select(u => new GetAdminUsersResponse
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                IsConfirmed = u.EmailConfirmed,
                IsLocked = u.LockoutEnabled,
                PhoneNumber = u.PhoneNumber,
                IsTwoFactorEnabled = u.TwoFactorEnabled,
                profileImageUrl = u.ProfileUrl,

                Roles = context.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(
                        context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => r.Name!
                    )
                    .ToList()
            }).OrderBy(b => b.Id);

            var PaginationResponse = await PaginatedList<GetAdminUsersResponse>.CreatePaginatedList(users, request.pageNumber, request.pageSize, cancellationToken);
            return responseHandler.Success(PaginationResponse, "Users Returned Successfully");
        }
    }
}
