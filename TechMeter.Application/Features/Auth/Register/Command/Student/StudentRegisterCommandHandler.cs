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
using TechMeter.Application.Interfaces.Services;
using TechMeter.Application.Interfaces.Services.Email;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.OTP;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Register.Command.Student
{
    public class StudentRegisterCommandHandler(IApplicationDbContext context,
        ResponseHandler responseHandler, ILogger<StudentRegisterCommandHandler> logger,
        ITokenService tokenService, IOTPService otpService,
        IBackgroundJobService backgroundJobService,UserManager<User> userManager) : IRequestHandler<StudentRegisterCommand, Response<StudentRegisterResponse>>
    {
        public async Task<Response<StudentRegisterResponse>> Handle(StudentRegisterCommand request, CancellationToken cancellationToken)
        {
            
            var user = await context.Users.Include(b => b.Student)
                .FirstOrDefaultAsync(b => b.Email == request.StudentRegisterRequest.Email && b.PhoneNumber == request.StudentRegisterRequest.PhoneNumber);

            if (user != null && user.EmailConfirmed)
            {
                logger.LogInformation("{Email} is registered", user.Email);
                return responseHandler.BadRequest<StudentRegisterResponse>("Email is already registered");
            }

            try
            {
                if (user != null && !user.EmailConfirmed)
                {

                    await UpdateStudentReRegister(user, request.StudentRegisterRequest, cancellationToken);
                }
                else
                {
                    user = new Domain.Models.Auth.Identity.User()
                    {
                        Id = Guid.NewGuid().ToString(),
                        UserName = request.StudentRegisterRequest.UserName,
                        Email = request.StudentRegisterRequest.Email,
                        PhoneNumber = request.StudentRegisterRequest.PhoneNumber,
                        Country = request.StudentRegisterRequest.Country,
                        Gender = request.StudentRegisterRequest.Gender,
                        ProfileUrl = request.StudentRegisterRequest.ProfilePhoto != null
                            ? backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadAsync(request.StudentRegisterRequest.ProfilePhoto,cancellationToken))
                            : string.Empty,
                    };

                    var results = await userManager.CreateAsync(user, request.StudentRegisterRequest.Password);

                    if (!results.Succeeded)
                    {
                        var errors = string.Join(",", results.Errors.Select(e => e.Description));
                        logger.LogWarning("Failed to create user: {Errors}", errors);
                        return responseHandler.BadRequest<StudentRegisterResponse>(errors);
                    }

                    await userManager.AddToRoleAsync(user, "student");

                    logger.LogInformation("New user created: {UserId}", user.Id);
                    var student = new Domain.Models.Auth.Users.Student()
                    {
                        User = user,
                        BirthDate = request.StudentRegisterRequest.BirthDate,
                        EducationLevel = request.StudentRegisterRequest.EducationLevel
                    };
                    await context.Student.AddAsync(student);
                }

                await context.SaveChangesAsync(cancellationToken);
                logger.LogInformation("Student created and role 'Student' assigned. ID: {UserId}", user.Id);

                var Tokens = await tokenService.GenerateTokensAsync(user, user.Id);
                var otp = await otpService.GenerateAndSetOTP(user.Id);
                backgroundJobService.Enqueue<IEmailService>(service => service.SendOtpEmailAsync(user.UserName ?? user.Email ?? "User", user.Email, otp));
                logger.LogInformation("User registration completed successfully. Email sent to {Email} pls confirm your email", request.StudentRegisterRequest.Email);
                var response = new StudentRegisterResponse()
                {
                    Id = user.Id,
                    Role = "Student",
                    PhoneNumber = request.StudentRegisterRequest.PhoneNumber,
                    UserName = request.StudentRegisterRequest.UserName,
                    Country = request.StudentRegisterRequest.Country,
                    Gender = request.StudentRegisterRequest.Gender,
                    ProfileUrl = user.ProfileUrl,
                    Age = request.StudentRegisterRequest.BirthDate != null ? (DateTime.UtcNow.Year - request.StudentRegisterRequest.BirthDate.Year) : null,
                    EducationLeveL = request.StudentRegisterRequest.EducationLevel,
                    EmailAddress = request.StudentRegisterRequest.Email,
                    isEmailConfirmed = false,
                    accessToken = Tokens.AccessToken,
                    refreshToken = Tokens.RefreshToken,
                };

                return responseHandler.Success<StudentRegisterResponse>(response, "Student Created Successfully");

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during ClientRegisterUserAsync for Email: {Email}", request.StudentRegisterRequest.Email);
                return responseHandler.BadRequest<StudentRegisterResponse>("An error occurred during registration.");
            }


        }
        private async Task UpdateStudentReRegister(Domain.Models.Auth.Identity.User user, StudentRegisterRequest request, CancellationToken cancellationToken)
        {

            user.UserName = request.UserName;
            user.PhoneNumber = request.PhoneNumber;
            user.Country = request.Country;
            user.Gender = request.Gender;
            if (request.ProfilePhoto != null)
            {
                user.ProfileUrl = backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadAsync(request.ProfilePhoto, cancellationToken));
            }
            user.Student.BirthDate = request.BirthDate;
            user.Student.EducationLevel = request.EducationLevel;

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            await userManager.ResetPasswordAsync(user, token, request.Password);
            await tokenService.InValidateOldTokenAsync(user.Id);
            await userManager.UpdateAsync(user);
            logger.LogInformation("Existing user updated: {UserId}", user.Id);
        }
    }
}
