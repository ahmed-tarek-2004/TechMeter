using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.User;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.UserProfile
{
    public interface IUserProfile
    {
        Task<Response<string>>EditSellerProfile(string providerId , EditProviderRequest request);
        Task<Response<GetProviderInfoResponse>>GetProviderInfoResponse(string Id);
    }
}
