using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Contact;
using TechMeter.Application.Features.Contact.Query.GetProviderContact;
using TechMeter.Application.Features.Contact.Query.GetStudentContact;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Contacts")]
    [Produces("application/json")]
    public class ContactController(IMediator mediator) : ControllerBase
    {
        [HttpGet("student")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Get student contacts",
            Description = "Requires JWT Bearer authentication with the student role. Returns a paginated list of providers the student has interacted with.",
            OperationId = "Contact_GetStudentContacts",
            Tags = new[] { "Contacts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Contacts retrieved successfully", typeof(Response<PaginatedList<AvailableContactResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<AvailableContactResponse>>>> GetStudentContacts([FromQuery] PaginatedRequest queryPage)
        {
            var query = new GetStudentContactsQuery(GetUserIdFromClaims(), queryPage.PageNumber, queryPage.PageSize);
            var result = await mediator.Send(query);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("provider")]
        [Authorize(Roles = "provider")]
        [SwaggerOperation(
            Summary = "Get provider contacts",
            Description = "Requires JWT Bearer authentication with the provider role. Returns a paginated list of students the provider has interacted with.",
            OperationId = "Contact_GetProviderContacts",
            Tags = new[] { "Contacts" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Contacts retrieved successfully", typeof(Response<PaginatedList<AvailableContactResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<AvailableContactResponse>>>> GetProviderContacts([FromQuery] PaginatedRequest queryPage)
        {
            var query = new GetProviderContactQuery(GetUserIdFromClaims(), queryPage.PageNumber, queryPage.PageSize);
            var result = await mediator.Send(query);
            return StatusCode((int)result.StatusCode, result);
        }

        private string GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim ?? "";
        }
    }
}
