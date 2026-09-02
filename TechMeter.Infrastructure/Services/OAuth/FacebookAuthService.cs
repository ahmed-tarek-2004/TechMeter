using FluentEmail.Core;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TechMeter.Application.DTO.OAuth;
using TechMeter.Application.Interfaces.Services.OAuth;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Infrastructure.Services.OAuth
{
    public class FacebookAuthService(HttpClient client, IConfiguration configuration) : IFacebookAuthService
    {
        public async Task<GetUserInfoResponse> GetUserInfoAsync(string accessToken, CancellationToken cancellationToken = default)
        {
            var fbAppId = configuration["Authentication:Facebook:ClientId"]?.Trim();
            var fbAppSecret = configuration["Authentication:Facebook:ClientSecret"]?.Trim();

            if (string.IsNullOrEmpty(fbAppId) || string.IsNullOrEmpty(fbAppSecret))
            {
                Console.WriteLine("Facebook App ID or Secret is not configured.");
                return new GetUserInfoResponse();
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
                    return new GetUserInfoResponse();
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
                    return new GetUserInfoResponse();
                }

                var meUrl =
                    $"https://graph.facebook.com/me" +
                    $"?fields=id,name,email" +
                    $"&access_token={Uri.EscapeDataString(accessToken)}";

                var meResp = await client.GetAsync(meUrl, cancellationToken);

                if (!meResp.IsSuccessStatusCode)
                {
                    var meErr = await meResp.Content.ReadAsStringAsync(cancellationToken);

                    Console.WriteLine($"FACEBOOK ME ERROR: {meErr}");

                    return new GetUserInfoResponse();
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

                return new GetUserInfoResponse
                {
                    name = fullName ?? string.Empty,
                    email = email ?? string.Empty,
                    subjects = providerId,
                    picture = $"https://graph.facebook.com/{providerId}/picture?type=large"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Facebook Exception: {ex}");
                return new GetUserInfoResponse();
            }
        }
    }
}
