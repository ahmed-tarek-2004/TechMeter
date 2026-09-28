using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetAdminUserById
{
    public class GetAdminUserByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler)
        : IRequestHandler<GetAdminUserByIdQuery, Response<GetAdminUsersResponse>>
    {
        public async Task<Response<GetAdminUsersResponse>> Handle(GetAdminUserByIdQuery request, CancellationToken cancellationToken)
        {
            var userExists = await context.Users.AnyAsync(b => b.Id == request.userId);
            if (!userExists)
            {
                return responseHandler.NotFound<GetAdminUsersResponse>("user is not found");
            }
            var user = await context.Users.AsNoTracking()
                .Where(b => b.Id == request.userId)
                .Select(u => new GetAdminUsersResponse
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
                }).FirstOrDefaultAsync(cancellationToken);

            return responseHandler.Success(user!, "user returned successfully");

        }
    }
}
