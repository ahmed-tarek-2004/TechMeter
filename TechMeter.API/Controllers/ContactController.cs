using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechMeter.Application.Features.Contact.Query.GetProviderContact;
using TechMeter.Application.Features.Contact.Query.GetStudentContact;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController(IMediator mediator) : ControllerBase
    {
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "student")]
        public async Task<IActionResult> GetStudentContacts([FromRoute] string studentId)
        {
            var query = new GetStudentContactsQuery(studentId);
            var result = await mediator.Send(query);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("provider/{providerId}")]
        [Authorize(Roles = "provider")]
        public async Task<IActionResult> GetProviderContacts([FromRoute] string providerId)
        {
            var query = new GetProviderContactQuery(providerId);
            var result = await mediator.Send(query);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}
