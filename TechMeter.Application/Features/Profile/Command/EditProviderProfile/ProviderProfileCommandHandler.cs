using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Features.Profile.Command.EditProviderProfile;
using TechMeter.Application.Interfaces.Services.MediaUpload;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.EditPRoviderProfile
{
    public class ProviderProfileCommandHandler(IApplicationDbContext context,IMediaUploading mediaUploading,
        ResponseHandler responseHandler) : IRequestHandler<ProviderProfileCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ProviderProfileCommand request, CancellationToken cancellationToken)
        {
            var provider = await context.Provider.Include(b => b.User).FirstOrDefaultAsync(p => p.Id == request.providerId);
            if (provider == null)
            {
                return responseHandler.NotFound<string>("Provider not found");
            }
            try
            {
                //Name
                if (!string.IsNullOrEmpty(request.EditProviderProfileRequest.ProviderName))
                {
                    provider.User.UserName = request.EditProviderProfileRequest.ProviderName;
                }
                //Email
                if (!string.IsNullOrEmpty(request.EditProviderProfileRequest.Email))
                {
                    provider.User.Email = request.EditProviderProfileRequest.Email;
                }
                //phone
                if (!string.IsNullOrEmpty(request.EditProviderProfileRequest.PhoneNumber))
                {
                    provider.User.PhoneNumber = request.EditProviderProfileRequest.PhoneNumber;
                }
                //counry
                if (!string.IsNullOrEmpty(request.EditProviderProfileRequest.Country))
                {
                    provider.User.Country = request.EditProviderProfileRequest.Country;
                }
                //bankacount
                if (!string.IsNullOrEmpty(request.EditProviderProfileRequest.BankAccount))
                {
                    provider.BankAccount = request.EditProviderProfileRequest.BankAccount;
                }
                //brief
                if (!string.IsNullOrEmpty(request.EditProviderProfileRequest.Brief))
                {
                    provider.Brief = request.EditProviderProfileRequest.Brief;
                }
                if (request.EditProviderProfileRequest.ExperienceYears.HasValue)
                {
                    provider.ExperienceYears = request.EditProviderProfileRequest.ExperienceYears.Value;
                }
                string profileUrl = string.Empty;
                if (request.EditProviderProfileRequest.profileImage != null)
                {
                    profileUrl = await mediaUploading.UploadAsync(request.EditProviderProfileRequest.profileImage);
                }
                provider.User.ProfileUrl = profileUrl;
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
