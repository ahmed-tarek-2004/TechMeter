using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.Otp;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.AuthService
{
    public interface IAuthService
    {
        public Task<Response<LoginResponseDto>> LoginAsync(LoginRequestDto request);
        public Task<Response<StudentRegisterResponse>> RegisterAsStudentAsync(StudentRegisterRequest request);
        public Task<Domain.Shared.Bases.Response<ProviderRegisterResponse>> RegisterAsProviderAsync(ProviderRegisterRequest request);
        public Task<Response<string>> VerifyConfirmEmailOtp(VerifyOtp request);
        public Task<Response<VerifyResetPasswordResponse>> VerifyResetPasswordOtp(VerifyOtp request);
        public Task<Response<string>> ResponseOtp(ResendOtp request);
        public Task<Response<StudentRegisterResponse>> LogoutAsync(ClaimsPrincipal userclaims);
        public Task<Response<ForgetPasswordResponse>> ForgetPassword(ForgetPasswordRequest request);
        public Task<Response<ResetPasswordResponse>> ResetPasswordAsync(ResetPasswordRequest request);
        public Task<Response<string>> ChangePassword(string UserId, ChangePassword request);
        //public Task<Response<string>> Logoutasync(string userId);
    }
}
