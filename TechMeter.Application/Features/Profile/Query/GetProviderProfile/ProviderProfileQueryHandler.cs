using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
//using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetProviderProfile
{
    public class ProviderProfileQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<ProviderProfileQuery, Response<GetProviderProfileInfoResponse>>
    {
        public async Task<Response<GetProviderProfileInfoResponse>> Handle(ProviderProfileQuery request, CancellationToken cancellationToken)
        {
            var response = await context.Provider.Where(b => b.Id == request.Id).Select(b => new GetProviderProfileInfoResponse
            {
                Id = b.Id,
                Country = b.User.Country,
                Email = b.User.Email,
                PhoneNumber = b.User.PhoneNumber,
                ProfileUrl = b.User.ProfileUrl,
                ProviderName = b.User.UserName,
                BankAccount = b.BankAccount,
                Brief = b.Brief!,
                ExperienceYears = b.ExperienceYears
            }).FirstOrDefaultAsync();
            return responseHandler.Success(response!, "Provider info retrieved successfully");
        }
    }
}
