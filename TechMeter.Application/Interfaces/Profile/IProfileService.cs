using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.UserProfile
{
    public interface IProfileService
    {
        Task<Response<string>>EditProviderProfileAsync(string providerId , EditProviderProfileRequest request);
        Task<Response<string>>EditStudentProfileAsync(string studentId , EditStudentProfileRequest request);
        Task<Response<GetProviderProfileInfoResponse>> GetProviderInfoResponseAsync(string Id);
        Task<Response<GetStudentProfileInfoResponse>> GetStudentInfoResponseAsync(string Id);
    }
}
