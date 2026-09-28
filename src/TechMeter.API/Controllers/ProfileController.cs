using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.DTO.User;
using TechMeter.Application.Features.Profile.Command.AdminBlockUser;
using TechMeter.Application.Features.Profile.Command.EditProviderProfile;
using TechMeter.Application.Features.Profile.Command.EditStudentProfile;
using TechMeter.Application.Features.Profile.Query.GetAdminUserById;
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
    [Produces("application/json")]
    public class ProfileController(IMediator mediator) : ControllerBase
    {

        [Authorize(Roles = "provider")]
        [HttpGet("provider")]
        [SwaggerOperation(
            Summary = "Get provider profile",
            Description = "Requires JWT Bearer authentication with the provider role. Returns the authenticated provider's profile information including biography and banking details.",
            OperationId = "Profile_GetProviderProfile",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Provider profile retrieved successfully", typeof(Response<GetProviderProfileInfoResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetProviderProfileInfoResponse>>> GetProviderProfileAsync()
        {
            var query = new ProviderProfileQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var response = await mediator.Send(query);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "provider")]
        [HttpPut("provider")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Update provider profile",
            Description = "Requires JWT Bearer authentication with the provider role. Updates the authenticated provider's profile details including avatar upload to Cloudinary.",
            OperationId = "Profile_UpdateProviderProfile",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Provider profile updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> UpdateProviderProfileAsync([FromForm] EditProviderProfileRequest request)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await mediator.Send(new ProviderProfileCommand(providerId ?? "", request));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpGet("student")]
        [SwaggerOperation(
            Summary = "Get student profile",
            Description = "Requires JWT Bearer authentication with the student role. Returns the authenticated student's profile information.",
            OperationId = "Profile_GetStudentProfile",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Student profile retrieved successfully", typeof(Response<GetStudentProfileInfoResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetStudentProfileInfoResponse>>> GetStudentProfileAsync()
        {
            var response = await mediator.Send(new StudentProfileQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPut("student")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Update student profile",
            Description = "Requires JWT Bearer authentication with the student role. Updates the authenticated student's profile details including avatar upload to Cloudinary.",
            OperationId = "Profile_UpdateStudentProfile",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Student profile updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> UpdateStudentProfileAsync([FromForm] EditStudentProfileRequest request)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await mediator.Send(new StudentProfileCommand(studentId ?? "", request));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("admin/users")]
        [SwaggerOperation(
            Summary = "Get all users (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Returns a paginated, filterable list of all platform users. Supports filtering by username, role, lock status, and 2FA status.",
            OperationId = "Profile_GetAdminUsers",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Users retrieved successfully", typeof(Response<PaginatedList<GetAdminUsersResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<GetAdminUsersResponse>>>> GetAdminUsersProfile([FromQuery] PaginatedRequest request, [FromQuery] GetAdminUsersRequest usersRequest)
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await mediator.Send(new GetAdminUsersQuery(adminId!, request.PageNumber, request.PageSize,
                usersRequest.UserName, usersRequest.role, usersRequest.IsLocked, usersRequest.IsTwoFactorEnabled));
            return StatusCode((int)response.StatusCode, response);
        }
        [Authorize(Roles = "admin")]
        [HttpGet("admin/user/{userId}")]
        [SwaggerOperation(
            Summary = "Get user by Id (admin)",
            Description = "Requires JWT Bearer authentication with the admin role.",
            OperationId = "Profile_GetAdminUserById",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "User retrieved successfully", typeof(Response<GetAdminUsersResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetAdminUsersResponse>>> GetAdminUserProfileByIdAsync([FromRoute] string userId)
        {

            var response = await mediator.Send(new GetAdminUserByIdQuery(userId));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("admin/user/{userId}/block")]
        [SwaggerOperation(
            Summary = "Block a user (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Locks the specified user account, preventing them from logging in.",
            OperationId = "Profile_BlockUser",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "User blocked successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "User not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "User is already blocked", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> AdminBlocksUserAsync([FromRoute] string userId)
        {
            var response = await mediator.Send(new AdminBlockUserCommand(userId));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("admin/user/{userId}/unblock")]
        [SwaggerOperation(
            Summary = "Unblock a user (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Unlocks the specified user account, restoring their ability to log in.",
            OperationId = "Profile_UnblockUser",
            Tags = new[] { "Users & Profile" })]
        [SwaggerResponse(StatusCodes.Status200OK, "User unblocked successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "User not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "User is not blocked", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> AdminUnBlocksUserAsync([FromRoute] string userId)
        {
            var response = await mediator.Send(new AdminUnBlockUserCommand(userId));
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
