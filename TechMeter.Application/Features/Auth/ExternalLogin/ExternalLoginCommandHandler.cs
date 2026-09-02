using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Auth;
using TechMeter.Application.Interfaces.Services.OAuth;
using TechMeter.Application.Interfaces.Services.Token;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ExternalLogin
{
    public class ExternalLoginCommandHandler(IApplicationDbContext context, IExternalLoginService externalLoginService,
        UserManager<User> userManager, ITokenService tokenService, ResponseHandler responseHandler)
        : IRequestHandler<ExternalLoginCommand, Response<LoginResponseDto>>
    {
        public async Task<Response<LoginResponseDto>> Handle(ExternalLoginCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var payload = await externalLoginService.AuthenticateAsync(request.provider, request.idToken, cancellationToken);

                var user = await userManager.FindByLoginAsync(request.provider, payload.subjects);
                if (user == null)
                {
                    user = await userManager.FindByEmailAsync(payload.email);
                    if (user == null)
                    {
                        user = new User
                        {
                            Id = Guid.NewGuid().ToString(),
                            Email = payload.email,
                            UserName = payload.email,
                            PhoneNumber = "",
                            EmailConfirmed = true,
                            ProfileUrl = payload.picture,
                            Country = "Not Specified",
                            //bir
                        };
                        var result = await userManager.CreateAsync(user);
                        if (!result.Succeeded)
                        {
                            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                            throw new Exception($"Failed to create user: {errors}");
                        }
                        await userManager.AddToRoleAsync(user, "student");
                        var student = new Student
                        {
                            Id = user.Id,
                            EducationLevel = "Not Specified",
                            BirthDate = new DateTime(2000, 1, 1),
                        };
                        await context.Student.AddAsync(student, cancellationToken);
                        await context.SaveChangesAsync(cancellationToken);
                    }
                    await userManager.AddLoginAsync(user, new UserLoginInfo(request.provider, payload.subjects, request.provider));
                }
                var token = await tokenService.GenerateTokensAsync(user, user.Id);
                var response = new LoginResponseDto
                {
                    AccessToken = token.AccessToken,
                    RefreshToken = token.RefreshToken,
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    IsEmailConfirmed = user.EmailConfirmed,
                    PhoneNumber = user.PhoneNumber,
                    Role = "student",
                    PhotoUrl = user.ProfileUrl
                };
                return responseHandler.Success(response, "Login successful");
            }
            catch (UnauthorizedAccessException ex)
            {
                return responseHandler.InternalServerError<LoginResponseDto>(ex.Message);
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<LoginResponseDto>(ex.Message);
            }

        }
    }
}
