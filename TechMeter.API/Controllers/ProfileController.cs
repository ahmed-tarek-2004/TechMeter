using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Application.Features.Profile.Command.EditProviderProfile;
using TechMeter.Application.Features.Profile.Command.EditStudentProfile;
using TechMeter.Application.Features.Profile.Query.GetAdminUsers;
using TechMeter.Application.Features.Profile.Query.GetProviderProfile;
using TechMeter.Application.Features.Profile.Query.StudentProfile.StudentProfileQuery;

//using TechMeter.Application.Features.Profile.Query.StudentProfile.StudentProfileQuery;
//using TechMeter.Application.Features.ProviderProfile.Command;

//using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;
namespace TechMeter.API.Controllers
{

    [Tags("Users & Profile")]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController(IMediator mediator) : ControllerBase
    {

        [Authorize(Roles = "provider")]
        [HttpGet("provider")]
        public async Task<ActionResult<Response<GetProviderProfileInfoResponse>>> GetProviderProfileAsync()
        {
            var query = new ProviderProfileQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var response = await mediator.Send(query);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "provider")]
        [HttpPut("provider")]
        public async Task<ActionResult<Response<string>>> UpdateProviderProfileAsync([FromForm] EditProviderProfileRequest request)
        {

            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await mediator.Send(new ProviderProfileCommand(providerId ?? "", request));
            return StatusCode((int)response.StatusCode, response);
        }
        [Authorize(Roles = "student")]
        [HttpGet("student")]
        public async Task<ActionResult<Response<GetStudentProfileInfoResponse>>> GetStudentProfileAsync()
        {
            var response = await mediator.Send(new StudentProfileQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPut("student")]
        public async Task<ActionResult<Response<string>>> UpdateStudentProfileAsync([FromForm] EditStudentProfileRequest request)
        {

            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await mediator.Send(new StudentProfileCommand(studentId ?? "", request));
            return StatusCode((int)response.StatusCode, response);
        }
        [Authorize(Roles = "admin")]
        [HttpGet("admin/users")]
        public async Task<ActionResult<Response<PaginatedList<GetAdminUsersResponse>>>> GetAdminUsersProfile([FromQuery] PaginatedRequest request, [FromQuery] GetAdminUsersRequest usersRequest)
        {

            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await mediator.Send(new GetAdminUsersCommand(adminId, request.PageNumber, request.PageSize,
                usersRequest.UserName, usersRequest.role, usersRequest.IsLocked, usersRequest.IsTwoFactorEnabled));
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
