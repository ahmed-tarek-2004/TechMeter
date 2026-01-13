using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Otp;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.AuthService
{
    public interface IAuthService
    {
        public Task<Response<LoginResponseDto>> LoginAsync(LoginRequestDto request);
        public Task<Response<StudentRegisterResponseDto>> RegisterAsStudentAsync(StudentRegisterRequestDto request);
        public Task<Response<StudentRegisterResponseDto>> LogoutAsync(ClaimsPrincipal userclaims);
        public Task<Response<string>> VerifyOtp(VerifyOtp request);
        public Task<Response<string>> ResponseOtp(ResendOtp request);
    }
}
