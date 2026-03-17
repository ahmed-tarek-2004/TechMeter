using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.User
{
    public class ProfileService : IProfileService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly IImageUploading _imageUploading;
        private readonly UserManager<Domain.Models.Auth.Identity.User> _userManager;
        public ProfileService(ApplicationDbContext context, UserManager<Domain.Models.Auth.Identity.User> userManager,
            ResponseHandler responseHandler, IImageUploading imageUploading)
        {
            _context = context;
            _userManager = userManager;
            _imageUploading = imageUploading;
            _responseHandler = responseHandler;
        }
        public async Task<Response<string>> EditProviderProfileAsync(string providerId, EditProviderProfileRequest request)
        {
            var provider = await _context.Provider.Include(b => b.User).FirstOrDefaultAsync(p => p.Id == providerId);
            if (provider == null)
            {
                return _responseHandler.NotFound<string>("Provider not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                //Name
                if (!string.IsNullOrEmpty(request.ProviderName))
                {
                    provider.User.UserName = request.ProviderName;
                }
                //Email
                if (!string.IsNullOrEmpty(request.Email))
                {
                    provider.User.Email = request.Email;
                }
                //phone
                if (!string.IsNullOrEmpty(request.PhoneNumber))
                {
                    provider.User.PhoneNumber = request.PhoneNumber;
                }
                //counry
                if (!string.IsNullOrEmpty(request.Country))
                {
                    provider.User.Country = request.Country;
                }
                //bankacount
                if (!string.IsNullOrEmpty(request.BankAccount))
                {
                    provider.BankAccount = request.BankAccount;
                }
                //brief
                if (!string.IsNullOrEmpty(request.Brief))
                {
                    provider.Brief = request.Brief;
                }
                if (request.ExperienceYears.HasValue)
                {
                    provider.ExperienceYears = request.ExperienceYears.Value;
                }
                string profileUrl = string.Empty;
                if (request.profileImage != null)
                {
                    profileUrl = await _imageUploading.UploadAsync(request.profileImage);
                }
                provider.User.ProfileUrl = profileUrl;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Success(string.Empty, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);

            }
        }

        public async Task<Response<string>> EditStudentProfileAsync(string studentId, EditStudentProfileRequest request)
        {
            var student = await _context.Student.Include(b => b.User).FirstOrDefaultAsync(p => p.Id == studentId);
            if (student == null)
            {
                return _responseHandler.NotFound<string>("student not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                //Name
                if (!string.IsNullOrEmpty(request.StudentName))
                {
                    student.User.UserName = request.StudentName;
                }
                //Email
                if (!string.IsNullOrEmpty(request.Email))
                {
                    student.User.Email = request.Email;
                }
                //phone
                if (!string.IsNullOrEmpty(request.PhoneNumber))
                {
                    student.User.PhoneNumber = request.PhoneNumber;
                }
                //counry
                if (!string.IsNullOrEmpty(request.Country))
                {
                    student.User.Country = request.Country;
                }
                //EducationLevel
                if (!string.IsNullOrEmpty(request.EducationLevel))
                {
                    student.EducationLevel = request.EducationLevel;
                }
                //birthday
                if (request.BirthDay.HasValue)
                {
                    student.BirthDate = request.BirthDay.Value;
                }
                string profileUrl = string.Empty;
                if (request.profileImage != null)
                {
                    profileUrl = await _imageUploading.UploadAsync(request.profileImage);
                }
                student.User.ProfileUrl = profileUrl;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Success(string.Empty, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        public async Task<Response<GetProviderProfileInfoResponse>> GetProviderInfoResponseAsync(string Id)
        {
            var response = await _context.Provider.Where(b => b.Id == Id).Select(b => new GetProviderProfileInfoResponse
            {
                Id = Id,
                Country = b.User.Country,
                Email = b.User.Email,
                PhoneNumber = b.User.PhoneNumber,
                ProfileUrl = b.User.ProfileUrl,
                ProviderName = b.User.UserName,
                BankAccount = b.BankAccount,
                Brief = b.Brief!,
                ExperienceYears = b.ExperienceYears
            }).FirstOrDefaultAsync();
            return _responseHandler.Success(response!, "Provider info retrieved successfully");
        }

        public async Task<Response<GetStudentProfileInfoResponse>> GetStudentInfoResponseAsync(string Id)
        {
            var response = await _context.Student.Where(b => b.Id == Id).Select(b => new GetStudentProfileInfoResponse
            {
                Id = b.Id,
                BirthDay = b.BirthDate,
                Country = b.User.Country,
                EducationLevel = b.EducationLevel,
                Email = b.User.Email,
                PhoneNumber = b.User.PhoneNumber,
                profileImage = b.User.ProfileUrl,
                StudentName = b.User.UserName,

            }).FirstOrDefaultAsync();
            return _responseHandler.Success(response, "Student info retrieved successfully");
        }
    }
}
