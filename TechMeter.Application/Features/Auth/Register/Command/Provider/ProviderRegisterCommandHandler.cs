using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.Features.Auth.Register.Command.Student;
using TechMeter.Application.Interfaces.Services;
using TechMeter.Application.Interfaces.Services.Email;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Register.Command.Provider
{
    public class ProviderRegisterCommandHandler(IApplicationDbContext context,
        ResponseHandler responseHandler, ILogger<StudentRegisterCommandHandler> logger,
        ITokenService tokenService, IOTPService otpService,
        IBackgroundJobService backgroundJobService, UserManager<User> userManager) : IRequestHandler<ProviderRegisterCommand, Response<ProviderRegisterResponse>>
    {
        public async Task<Response<ProviderRegisterResponse>> Handle(ProviderRegisterCommand request, CancellationToken cancellationToken)
        {
         
            var user = await context.Users.Include(b => b.Provider)
                .FirstOrDefaultAsync(b => b.Email == request.ProviderRegisterRequest.Email);
            //if (checkifEmailorPhone != null)
            //{
            //    logger.LogInformation("{checkifEmailorPhone}", checkifEmailorPhone);
            //    return responseHandler.BadRequest<StudentRegisterResponse>(checkifEmailorPhone);
            //}
            if (user != null && user.EmailConfirmed)
            {
                logger.LogInformation("{Email} is registered", user.Email);
                return responseHandler.BadRequest<ProviderRegisterResponse>("Email is already registered");
            }
            try
            {
                if (user != null && !user.EmailConfirmed)
                {
                    await UpdateProviderReRegister(user, request.ProviderRegisterRequest);
                }
                else
                {
                    user = new Domain.Models.Auth.Identity.User()
                    {
                        Id = Guid.NewGuid().ToString(),
                        UserName = request.ProviderRegisterRequest.UserName,
                        Email = request.ProviderRegisterRequest.Email,
                        PhoneNumber = request.ProviderRegisterRequest.PhoneNumber,
                        Country = request.ProviderRegisterRequest.Country,
                        Gender = request.ProviderRegisterRequest.Gender,
                        ProfileUrl = request.ProviderRegisterRequest.ProfilePhoto != null ? backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadAsync(request.ProviderRegisterRequest.ProfilePhoto)) : string.Empty,
                    };
                    var result = await userManager.CreateAsync(user, request.ProviderRegisterRequest.Password);
                    if (!result.Succeeded)
                    {
                        var error = result.Errors.Select(e => e.Description).ToList();
                        logger.LogWarning("Failed To create User With Email : {Email}, has error : {errors}", request.ProviderRegisterRequest.Email, string.Join(",", error));
                        return responseHandler.BadRequest<ProviderRegisterResponse>(string.Join(",", error));
                    }
                    await userManager.AddToRoleAsync(user, "provider");

                    var provider = new Domain.Models.Auth.Users.Provider()
                    {
                        User = user,
                        BankAccount = request.ProviderRegisterRequest.BankAccount,
                        Brief = request.ProviderRegisterRequest.Brief,
                        ExperienceYears = request.ProviderRegisterRequest.ExperienceYears,
                        certificatesUrls = null,

                    };

                    await context.Provider.AddAsync(provider);

                    logger.LogInformation("Student created and role 'Student' assigned. ID: {UserId}", user.Id);
                }

                var Tokens = await tokenService.GenerateTokensAsync(user, user.Id);
                var otp = await otpService.GenerateAndSetOTP(user.Id);
                backgroundJobService.Enqueue<IEmailService>(service => service.SendOtpEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, otp));

                await context.SaveChangesAsync(cancellationToken);
                logger.LogInformation("User registration completed successfully. Email sent to {Email} pls confirm your email", request.ProviderRegisterRequest.Email);
                var response = new ProviderRegisterResponse()
                {
                    Id = user.Id,
                    Role = "Provider",
                    PhoneNumber = request.ProviderRegisterRequest.PhoneNumber,
                    UserName = request.ProviderRegisterRequest.UserName,
                    Country = request.ProviderRegisterRequest.Country,
                    Gender = request.ProviderRegisterRequest.Gender,
                    ProfilePhoto = user.ProfileUrl,
                    BankAccount = request.ProviderRegisterRequest.BankAccount,
                    Brief = request.ProviderRegisterRequest.Brief,
                    Email = request.ProviderRegisterRequest.Email,
                    ExperienceYears = request.ProviderRegisterRequest.ExperienceYears,
                    IsEmailConfirmed = false,
                    AccessToken = Tokens.AccessToken,
                    RefreshToken = Tokens.RefreshToken,
                };

                return responseHandler.Success(response, "Provider Created Successfully");

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during RegisterAsProviderAsync for Email: {Email}", request.ProviderRegisterRequest.Email);
                return responseHandler.BadRequest<ProviderRegisterResponse>("An error occurred during registration.");
            }

        }
        private async Task UpdateProviderReRegister(Domain.Models.Auth.Identity.User user, ProviderRegisterRequest request)
        {
            user.UserName = request.UserName;
            user.PhoneNumber = request.PhoneNumber;
            user.Country = request.Country;
            user.Gender = request.Gender;
            if (request.ProfilePhoto != null)
            {
                user.ProfileUrl = backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadAsync(request.ProfilePhoto));
            }
            user.Provider.Brief = request.Brief;
            user.Provider.BankAccount = request.BankAccount;
            user.Provider.ExperienceYears = request.ExperienceYears;
            //user.Provider.b

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            await userManager.ResetPasswordAsync(user, token, request.Password);

            await tokenService.InValidateOldTokenAsync(user.Id);
            logger.LogInformation("Existing user updated: {UserId}", user.Id);
        }

    }
}
