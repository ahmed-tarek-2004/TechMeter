using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.AdminBlockUser
{
    public class AdminUnBlockUserCommandHandler(UserManager<User> userManager, ResponseHandler responseHandler) :
        IRequestHandler<AdminUnBlockUserCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AdminUnBlockUserCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.userId);
            if (user == null)
            {
                return responseHandler.NotFound<string>("User IS Not Found");
            }
            var result = await userManager.SetLockoutEndDateAsync(user, null);

            if (!result.Succeeded)
            {
                return responseHandler.BadRequest<string>("An Error Occured");
            }
            return responseHandler.Success(string.Empty, "User Blocked Successfully");
        }
    }
}
