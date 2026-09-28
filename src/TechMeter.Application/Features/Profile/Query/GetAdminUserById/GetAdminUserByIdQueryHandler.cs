using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetAdminUserById
{
    public class GetAdminUserByIdQueryHandler(IApplicationDbContext context, UserManager<User> userManager, ResponseHandler responseHandler)
        : IRequestHandler<GetAdminUserByIdQuery, Response<GetAdminUsersResponse>>
    {
        public async Task<Response<GetAdminUsersResponse>> Handle(GetAdminUserByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(b => b.Id == request.userId);
            if (user == null)
            {
                return responseHandler.NotFound<GetAdminUsersResponse>("user is not found");
            }
            var role = await userManager.GetRolesAsync(user);
            var userResposne = await context.Users.AsNoTracking()
                .Where(b => b.Id == request.userId)
                .Select(u => new GetAdminUsersResponse
                {
                    Id = u.Id,
                    Email = u.Email,
                    UserName = u.UserName,
                    FullName = u.FullName,
                    IsConfirmed = u.EmailConfirmed,
                    IsLocked = u.LockoutEnd == null ? false : u.LockoutEnd > DateTime.UtcNow ? false : true,
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
                    .ToList(),
                    totalOrders = role.FirstOrDefault() == "student" ?
                     context.Order.Count(b => b.StudentId == user.Id) :
                     //u.Student.Orders.Count(b=>b.StudentId==user.Id) :
                     context.OrderItem.Select(x => x.OrderId).Distinct().Count(),
                    //tot
                }).FirstOrDefaultAsync(cancellationToken);

            return responseHandler.Success(userResposne!, "user returned successfully");

        }
    }
}
