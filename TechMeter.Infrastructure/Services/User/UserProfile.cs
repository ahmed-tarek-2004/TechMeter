using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.User;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.User
{
    public class UserProfile : IUserProfile
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly IImageUploading _imageUploading;
        private readonly UserManager<Domain.Models.Auth.Identity.User> _userManager;
        public UserProfile(ApplicationDbContext context, UserManager<Domain.Models.Auth.Identity.User> userManager,
            ResponseHandler responseHandler, IImageUploading imageUploading)
        {
            _context = context;
            _userManager = userManager;
            _imageUploading = imageUploading;
            _responseHandler = responseHandler;
        }
        public async Task<Response<string>> EditProviderProfileAsync(string providerId, EditProviderRequest request)
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

        public async Task<Response<GetProviderInfoResponse>> GetProviderInfoResponseAsync(string Id)
        {
            var response = await _context.Provider.Where(b => b.Id == Id).Select(b => new GetProviderInfoResponse
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
    }
}
