using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Contact;
using TechMeter.Application.Features.Contact.Query.GetProviderContact;
using TechMeter.Application.Features.Contact.Query.GetStudentContact;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController(IMediator mediator) : ControllerBase
    {
        [HttpGet("student")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<PaginatedList<AvailableContactResponse>>>> GetStudentContacts([FromQuery] PaginatedRequest queryPage)
        {
            var query = new GetStudentContactsQuery(GetUserIdFromClaims(), queryPage.PageNumber, queryPage.PageSize);
            var result = await mediator.Send(query);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("provider")]
        [Authorize(Roles = "provider")]
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
