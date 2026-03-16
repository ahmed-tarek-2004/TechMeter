using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;
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
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Application.Interfaces.OTPService;
using TechMeter.Application.Interfaces.TokenService;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFib1RhcmVrIiwibmFtZWlkIjoiMzdjODZiOWYtMzE5Ni00ZGMzLTljMjUtZTkzNjBmN2NkODcxIiwiZW1haWwiOiJhaG1lZHRhcmVrNzU4MEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IjAxMTU4OTA1NTg5Iiwicm9sZSI6InN0dWRlbnQiLCJuYmYiOjE3NzExNzM2NjUsImV4cCI6MTc3MTc3ODQ2NSwiaWF0IjoxNzcxMTczNjY1fQ.oR7d2tqTgYnBJMD8CEGL3OydwpFiPE0KltlvI0347gQ

namespace TechMeter.Infrastructure.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;
        private readonly IImageUploading _imageUploading;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IOTPService _otpService;
        private readonly ResponseHandler _responseHandler;
        public AuthService(ITokenService tokenService, ILogger<AuthService> logger,
            ApplicationDbContext context, UserManager<User> userManager, IImageUploading imageUploading,
            ResponseHandler responseHandler, IOTPService otpService, IEmailService emailService)
        {
            _tokenService = tokenService;
            _logger = logger;
            _context = context;
            _userManager = userManager;
            _responseHandler = responseHandler;
            _otpService = otpService;
            _emailService = emailService;
            _imageUploading = imageUploading;
        }

        public async Task<Domain.Shared.Bases.Response<LoginResponseDto>> LoginAsync(LoginRequestDto request)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.email);
                if (user == null)
                {
                    _logger.LogWarning("User with Email {request.email} : Not Found", request.email);
                    return _responseHandler.NotFound<LoginResponseDto>($"User with Email {request.email} : Not Found");
                }
                bool checkPassword = await _userManager.CheckPasswordAsync(user, request.password);
                if (!checkPassword)
                {
                    _logger.LogWarning("Password is Incorrext");
                    return _responseHandler.BadRequest<LoginResponseDto>("Password is InCorrect");
                }
                if (!user.EmailConfirmed)
                {
                    return _responseHandler.BadRequest<LoginResponseDto>("verify Your Email");
                }
                var otp = request.otp;
                if (string.IsNullOrEmpty(otp))
                {
                    otp = await _otpService.GenerateAndSetOTP(user.Id);
                    await _emailService.SendOtpEmailAsync(user, otp);
                    _logger.LogInformation($"Otp Sent is : {otp}");

                    return _responseHandler.Success<LoginResponseDto>(new LoginResponseDto { Id = user.Id }, "Oto Has sent via Email Plz Confirm");
                }
                else
                {
                    var confirmOTP = await _otpService.ValidateOtp(request.otp, user.Id);
                    if (!confirmOTP)
                    {
                        return _responseHandler.BadRequest<LoginResponseDto>("Enter A correct OTP");
                    }
                }
                var roles = await _userManager.GetRolesAsync(user);
                var token = await _tokenService.GenerateTokensAsync(user, user.Id);
                var respone = new LoginResponseDto()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    PhotoUrl = user.ProfileUrl,
                    Role = roles.FirstOrDefault(),
                    AccessToken = token.AccessToken,
                    RefreshToken = token.RefreshToken,
                    IsEmailConfirmed = user.EmailConfirmed,
                };
                _logger.LogInformation("LoggedIn Successfully");
                return _responseHandler.Success<LoginResponseDto>(respone, "User Logined in Successfully");
            }
            catch (Exception ex)
            {
                _logger.LogInformation("Internal Server Error");
                return _responseHandler.InternalServerError<LoginResponseDto>("Internal Server Error");
            }
        }
        public async Task<Domain.Shared.Bases.Response<StudentRegisterResponse>> RegisterAsStudentAsync(StudentRegisterRequest request)
        {
            var checkifEmailorPhone = await CheckEmailOrPhoneNumberAsync(request.Email, request.PhoneNumber);
            if (checkifEmailorPhone != null)
            {
                _logger.LogInformation("{checkifEmailorPhone}", checkifEmailorPhone);
                return _responseHandler.BadRequest<StudentRegisterResponse>(checkifEmailorPhone);
            }
            await using var transaction = _context.Database.BeginTransaction();
            try
            {
                var user = new User()
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = request.UserName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    Country = request.Country,
                    Gender = request.Gender,
                    ProfileUrl = request.ProfilePhoto != null ? await _imageUploading.UploadAsync(request.ProfilePhoto) : null,
                };
                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    var error = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("Failed To create User With Email : {Email}, has error : {errors}", request.Email, string.Join(",", error));
                    return _responseHandler.BadRequest<StudentRegisterResponse>(string.Join(",", error));
                }
                await _userManager.AddToRoleAsync(user, "student");

                var student = new Student()
                {
                    User = user,
                    BirthDate = request.BirthDate,
                    EducationLevel = request.EducationLevel
                };

                await _context.Student.AddAsync(student);

                _logger.LogInformation("Student created and role 'Student' assigned. ID: {UserId}", user.Id);

                var Tokens = await _tokenService.GenerateTokensAsync(user, user.Id);
                var otp = await _otpService.GenerateAndSetOTP(user.Id);
                await _emailService.SendOtpEmailAsync(user, otp);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation("User registration completed successfully. Email sent to {Email} pls confirm your email", request.Email);
                var response = new StudentRegisterResponse()
                {
                    Id = user.Id,
                    Role = "Student",
                    PhoneNumber = request.PhoneNumber,
                    UserName = request.UserName,
                    Country = request.Country,
                    Gender = request.Gender,
                    ProfileUrl = user.ProfileUrl,
                    Age = request.BirthDate != null ? (DateTime.UtcNow.Year - request.BirthDate.Year) : null,
                    EducationLeveL = request.EducationLevel,
                    EmailAddress = request.Email,
                    isEmailConfirmed = false,
                    accessToken = Tokens.AccessToken,
                    refreshToken = Tokens.RefreshToken,
                };

                return _responseHandler.Success<StudentRegisterResponse>(response, "Student Created Successfully");

            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error occurred during ClientRegisterUserAsync for Email: {Email}", request.Email);
                return _responseHandler.BadRequest<StudentRegisterResponse>("An error occurred during registration.");
            }

        }
        public async Task<Domain.Shared.Bases.Response<ProviderRegisterResponse>> RegisterAsProviderAsync(ProviderRegisterRequest request)
        {
            var checkifEmailorPhone = await CheckEmailOrPhoneNumberAsync(request.Email, request.PhoneNumber);
            if (checkifEmailorPhone != null)
            {
                _logger.LogInformation("{checkifEmailorPhone}", checkifEmailorPhone);
                return _responseHandler.BadRequest<ProviderRegisterResponse>(checkifEmailorPhone);
            }
            var transaction = _context.Database.BeginTransaction();
            try
            {
                var user = new User()
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = request.UserName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    Country = request.Country,
                    Gender = request.Gender,
                    ProfileUrl = request.ProfilePhoto != null ? await _imageUploading.UploadAsync(request.ProfilePhoto) : null,
                };
                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    var error = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("Failed To create User With Email : {Email}, has error : {errors}", request.Email, string.Join(",", error));
                    return _responseHandler.BadRequest<ProviderRegisterResponse>(string.Join(",", error));
                }
                await _userManager.AddToRoleAsync(user, "provider");

                //var certificationsUrl = new CertificatesUrl()
                //{
                //    Id = Guid.NewGuid().ToString(),
                //    ProviderId = user.Id,
                //    CertificateUrl = _imageUploading.UploadAsync(request.ProfilePhoto)

                //};

                var provider = new Provider()
                {
                    User = user,
                    BankAccount = request.BankAccount,
                    Brief = request.Brief,
                    ExperienceYears = request.ExperienceYears,
                    certificatesUrls = null,

                };

                await _context.Provider.AddAsync(provider);

                _logger.LogInformation("Student created and role 'Student' assigned. ID: {UserId}", user.Id);

                var Tokens = await _tokenService.GenerateTokensAsync(user, user.Id);
                var otp = await _otpService.GenerateAndSetOTP(user.Id);
                await _emailService.SendOtpEmailAsync(user, otp);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation("User registration completed successfully. Email sent to {Email} pls confirm your email", request.Email);
                var response = new ProviderRegisterResponse()
                {
                    Id = user.Id,
                    Role = "Provider",
                    PhoneNumber = request.PhoneNumber,
                    UserName = request.UserName,
                    Country = request.Country,
                    Gender = request.Gender,
                    ProfilePhoto = user.ProfileUrl,
                    BankAccount = request.BankAccount,
                    Brief = request.Brief,
                    Email = request.Email,
                    ExperienceYears = request.ExperienceYears,
                    BirthDate = request.BirthDate,
                    IsEmailConfirmed = false,
                    AccessToken = Tokens.AccessToken,
                    RefreshToken = Tokens.RefreshToken,
                };

                return _responseHandler.Success(response, "Provider Created Successfully");

            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error occurred during RegisterAsProviderAsync for Email: {Email}", request.Email);
                return _responseHandler.BadRequest<ProviderRegisterResponse>("An error occurred during registration.");
            }

        }
        public async Task<Domain.Shared.Bases.Response<StudentRegisterResponse>> LogoutAsync(ClaimsPrincipal userclaims)
        {
            try
            {
                var userId = userclaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return _responseHandler.UnAuthorized<StudentRegisterResponse>("User Not Authenticated");
                }
                await _tokenService.InValidateOldTokenAsync(userId);
                return _responseHandler.Success<StudentRegisterResponse>(null, "User Logout Successfully");
            }
            catch (Exception ex)
            {
                return _responseHandler.InternalServerError<StudentRegisterResponse>($"An error occurred during logout: {ex.Message}");
            }

        }
        private async Task<string> CheckEmailOrPhoneNumberAsync(string EmailAddress, string Phone)
        {
            var user = _context.Users.FirstOrDefault(b => b.Email == EmailAddress || b.PhoneNumber == Phone);
            return user != null ? "Email or Phone Already Registerd" : null;
        }
        public async Task<Response<string>> VerifyConfirmEmailOtp(VerifyOtp verifyOtp)
        {
            await using var transaction = _context.Database.BeginTransaction();
            try
            {
                var user = await _userManager.FindByIdAsync(verifyOtp.userId);
                if (user == null)
                {
                    return _responseHandler.BadRequest<string>("User is not found");
                }

                if (user.EmailConfirmed)
                    return _responseHandler.Success<string>(null, "Email is already verified.");
                var isValid = await _otpService.ValidateOtp(verifyOtp.otp, verifyOtp.userId);
                if (!isValid)
                {
                    return _responseHandler.BadRequest<string>("Otp is not Correct");
                }
                user.EmailConfirmed = true;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Success<string>(null, "Email is confirmed successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>("internal server Error");
            }
        }
        public async Task<Response<VerifyResetPasswordResponse>> VerifyResetPasswordOtp(VerifyOtp verifyOtp)
        {
            await using var transaction = _context.Database.BeginTransaction();
            try
            {
                var user = await _userManager.FindByIdAsync(verifyOtp.userId);
                if (user == null)
                {
                    return _responseHandler.BadRequest<VerifyResetPasswordResponse>("User is not found");
                }
                var isValid = await _otpService.ValidateOtp(verifyOtp.otp, verifyOtp.userId);
                if (!isValid)
                {
                    return _responseHandler.BadRequest<VerifyResetPasswordResponse>("Otp is not Correct");
                }
                var Token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await transaction.CommitAsync();
                var response = new VerifyResetPasswordResponse
                {
                    token = Token,
                };
                return _responseHandler.Success<VerifyResetPasswordResponse>(response, "otp is verified");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<VerifyResetPasswordResponse>(ex.Message);
            }
        }

        public async Task<Response<string>> ResponseOtp(ResendOtp request)
        {
            var user = await _userManager.FindByIdAsync(request.Id);
            if (user == null)
            {
                return _responseHandler.BadRequest<string>("user is not found");
            }
            if (user.EmailConfirmed)
            {
                return _responseHandler.Success<string>(null, "Email is already verified.");
            }
            var otp = await _otpService.GenerateAndSetOTP(user.Id);
            await _emailService.SendOtpEmailAsync(user, otp);
            _logger.LogInformation("Email With {Otp} has ben Sent to {Email}", otp, user.Email);
            return _responseHandler.Success<string>(null, "Email Has been Sent successfully");
        }

        public async Task<Response<ForgetPasswordResponse>> ForgetPassword(ForgetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return _responseHandler.BadRequest<ForgetPasswordResponse>($"User With Email {request.Email} Is not Found");
            }
            try
            {
                var otp = await _otpService.GenerateAndSetOTP(user.Id);
                await _emailService.SendOtpEmailAsync(user, otp);
                _logger.LogInformation("Email for forget Password is Sent");
                var response = new ForgetPasswordResponse()
                {
                    UserId = user.Id,
                };

                return _responseHandler.Success(response, "Check Email For Otp");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return _responseHandler.InternalServerError<ForgetPasswordResponse>("Error Happend When Creating OTP Or Send Email");
            }
        }

        public async Task<Response<ResetPasswordResponse>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {
                return _responseHandler.BadRequest<ResetPasswordResponse>($"User With Id {request.UserId} Is not Found");
            }
            //var IsValid = await _otpService.ValidateOtp(request.OTP, user.Id);
            //if (!IsValid)
            //{
            //    _responseHandler.BadRequest<ResetPasswordResponse>("Otp IS Wrong");
            //}
            //var PasswordToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var changePassword = await _userManager.ResetPasswordAsync(user, request.token, request.Password);
            if (!changePassword.Succeeded)
            {
                var Errors = string.Join(",", changePassword.Errors.Select(e => e.Description).ToList());
                _responseHandler.Forbidden<ResetPasswordResponse>(Errors);
            }
            await _tokenService.InValidateOldTokenAsync(user.Id);
            var roles = await _userManager.GetRolesAsync(user);
            var respnse = new ResetPasswordResponse()
            {
                UserId = user.Id,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = roles.FirstOrDefault()
            };
            return _responseHandler.Success(respnse, "Password Has been Reset Successfully");
            //throw new NotImplementedException();
        }

        public async Task<Response<string>> ChangePassword(string UserId, ChangePassword request)
        {
            var user = await _userManager.FindByIdAsync(UserId);
            if (user == null)
            {
                return _responseHandler.BadRequest<string>($"User With {UserId} is not found ");
            }

            var checkPassword = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!checkPassword)
            {
                return _responseHandler.BadRequest<string>("Current password is incorrect");
            }

            var changePassword = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!changePassword.Succeeded)
            {
                var Errors = string.Join(",", changePassword.Errors.Select(e => e.Description).ToList());
                return _responseHandler.BadRequest<string>(Errors);
            }
            await _tokenService.InValidateOldTokenAsync(UserId);

            return _responseHandler.Success<string>(null, "Password changed successfully. Please login again.");

        }


    }
}
