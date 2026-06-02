using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.DTO.Otp;
using TechMeter.Application.Features.Auth.ChangePassword;
using TechMeter.Application.Features.Auth.ConfirmEmail;
using TechMeter.Application.Features.Auth.ConfirmResetPassword;
using TechMeter.Application.Features.Auth.Login.Command;
using TechMeter.Application.Features.Auth.Register.Command.Provider;
using TechMeter.Application.Features.Auth.Register.Command.Student;
using TechMeter.Application.Features.Auth.ResendOtp;
using TechMeter.Application.Features.Auth.ResetPassword;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.AuthService
{
    public interface IAuthService
    {
        public Task<Response<LoginResponseDto>> LoginAsync(string email, string password, string otp = "");
        public Task<Response<StudentRegisterResponse>> RegisterAsStudentAsync(StudentRegisterRequest request);
        public Task<Domain.Shared.Bases.Response<ProviderRegisterResponse>> RegisterAsProviderAsync(ProviderRegisterRequest request);
        public Task<Response<string>> VerifyConfirmEmailOtp(string userId, string otp);
        public Task<Response<VerifyResetPasswordResponse>> VerifyResetPasswordOtp(string userId, string otp);
        public Task<Response<string>> ResponseOtp(string otp);
        public Task<Response<string>> LogoutAsync(ClaimsPrincipal userclaims);
        public Task<Response<ForgetPasswordResponse>> ForgetPassword(string request);
        public Task<Response<ResetPasswordResponse>> ResetPasswordAsync(string userId, string token, string password, string confirmPassword);
        public Task<Response<string>> ChangePasswordAsync(string userId, ChangePasswordRequest request);
        //public Task<Response<string>> Logoutasync(string userId);
    }
}
