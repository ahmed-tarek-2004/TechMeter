using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController(IProfileService profileService) : ControllerBase
    {

        [Authorize(Roles = "provider")]
        [HttpGet("provider/profile")]
        public async Task<ActionResult<Response<GetProviderProfileInfoResponse>>> GetProviderProfileAsync()
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await profileService.GetProviderInfoResponseAsync(providerId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "provider")]
        [HttpPut("provider/update/profile")]
        public async Task<ActionResult<Response<EditProviderProfileRequest>>> UpdateProviderProfileAsync([FromForm] EditProviderProfileRequest request)
        {

            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await profileService.EditProviderProfileAsync(providerId ?? "", request);
            return StatusCode((int)response.StatusCode, response);
        }
        [Authorize(Roles = "student")]
        [HttpGet("student/profile")]
        public async Task<ActionResult<Response<GetProviderProfileInfoResponse>>> GetStudentProfileAsync()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await profileService.GetStudentInfoResponseAsync(studentId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPut("student/update/profile")]
        public async Task<ActionResult<Response<EditProviderProfileRequest>>> UpdateStudentProfileAsync([FromForm] EditStudentProfileRequest request)
        {

            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await profileService.EditStudentProfileAsync(studentId ?? "", request);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
