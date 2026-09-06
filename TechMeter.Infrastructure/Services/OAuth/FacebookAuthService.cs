using FluentEmail.Core;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TechMeter.Application.DTO.OAuth;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.MediaUpload;
using TechMeter.Application.Interfaces.Services.OAuth;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Infrastructure.Services.OAuth
{
    public class FacebookAuthService(HttpClient client, IConfiguration configuration,
        IMediaUploading mediaUploadingService) : IFacebookAuthService
    {
        public async Task<GetUserInfoResponse> GetUserInfoAsync(string accessToken, CancellationToken cancellationToken = default)
        {
            var fbAppId = configuration["Authentication:Facebook:ClientId"]?.Trim();
            var fbAppSecret = configuration["Authentication:Facebook:ClientSecret"]?.Trim();

            if (string.IsNullOrEmpty(fbAppId) || string.IsNullOrEmpty(fbAppSecret))
            {
                Console.WriteLine("Facebook App ID or Secret is not configured.");
                throw new InvalidOperationException("Facebook App ID or Secret is not configured.");
            }

            var appToken = $"{fbAppId}|{fbAppSecret}";

            var debugUrl =
                $"https://graph.facebook.com/debug_token" +
                $"?input_token={Uri.EscapeDataString(accessToken)}" +
                $"&access_token={Uri.EscapeDataString(appToken)}";

            try
            {
                var dbgResp = await client.GetAsync(debugUrl, cancellationToken);
                var fbResponse = await dbgResp.Content.ReadAsStringAsync(cancellationToken);

                if (!dbgResp.IsSuccessStatusCode)
                {
                    Console.WriteLine($"FACEBOOK ERROR: {fbResponse}");
                    throw new HttpRequestException(
                        $"Facebook token validation failed. Status Code: {dbgResp.StatusCode}");
                }

                using var dbgStream = await dbgResp.Content.ReadAsStreamAsync(cancellationToken);

                using var dbgJson = await JsonDocument.ParseAsync(dbgStream, cancellationToken: cancellationToken);

                var root = dbgJson.RootElement;

                string providerId = string.Empty;

                if (root.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("is_valid", out var isValid) &&
                    isValid.GetBoolean())
                {
                    if (data.TryGetProperty("user_id", out var uid))
                    {
                        providerId = uid.GetString() ?? string.Empty;
                    }
                }
                else
                {
                    Console.WriteLine($"Token Invalid Data: {fbResponse}");
                    throw new UnauthorizedAccessException(
                        "Facebook access token is invalid.");
                }

                var meUrl =
                    $"https://graph.facebook.com/me" +
                    $"?fields=id,name,email,picture.type(large)" +
                    $"&access_token={Uri.EscapeDataString(accessToken)}";

                var meResp = await client.GetAsync(meUrl, cancellationToken);

                if (!meResp.IsSuccessStatusCode)
                {
                    var meErr = await meResp.Content.ReadAsStringAsync(cancellationToken);

                    Console.WriteLine($"FACEBOOK ME ERROR: {meErr}");

                    throw new HttpRequestException(
                        $"Failed to retrieve Facebook user information. Status Code: {meResp.StatusCode}");
                }

                using var meStream = await meResp.Content.ReadAsStreamAsync(cancellationToken);

                using var meJson = await JsonDocument.ParseAsync(meStream, cancellationToken: cancellationToken);

                var meRoot = meJson.RootElement;

                string? email = null;
                string? fullName = null;

                if (meRoot.TryGetProperty("email", out var emailProp))
                    email = emailProp.GetString();

                if (meRoot.TryGetProperty("name", out var nameProp))
                    fullName = nameProp.GetString();

                var imageBytes = await GetFacebookProfilePictureAsync(meRoot, accessToken, cancellationToken);

                return new GetUserInfoResponse
                {
                    name = fullName ?? string.Empty,
                    email = email ?? string.Empty,
                    subjects = providerId,
                    picture = imageBytes != null ?
                    await mediaUploadingService.UploadImageBytesAsync(imageBytes ?? Array.Empty<byte>(), $"{providerId}_facebook_profile")
                    : string.Empty
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Facebook Exception: {ex}");
                throw new InvalidOperationException("An error occurred while retrieving user information from Facebook.", ex);
            }
        }

        private async Task<byte[]> GetFacebookProfilePictureAsync(JsonElement meRoot, string accessToken, CancellationToken cancellationToken)
        {
            string? picture = null;

            if (meRoot.TryGetProperty("picture", out var pictureProp) &&
                pictureProp.TryGetProperty("data", out var pictureData))
            {
                if (pictureData.TryGetProperty("url", out var pictureUrl))
                {
                    picture = pictureUrl.GetString();
                }
            }

            byte[]? imageBytes = null;
            if (!string.IsNullOrEmpty(picture))
            {
                Console.WriteLine("Facebook picture URL is null or empty.");
                imageBytes = await client.GetByteArrayAsync(picture ?? string.Empty, cancellationToken);
            }
            return imageBytes ?? Array.Empty<byte>();
        }
    }
}
