using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Features.Section.Command.AddSection;
using TechMeter.Application.Features.Section.Command.DeleteSection;
using TechMeter.Application.Features.Section.Command.EditSection;
using TechMeter.Application.Features.Section.Query.GetAllSection;
using TechMeter.Application.Features.Section.Query.GetSectionById;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionController(IMapper mapper, IMediator mediator) : ControllerBase
    {

        [HttpGet("course/{courseId}/get-section-detail/{Id}")]
        [Authorize]
        public async Task<ActionResult<Response<GetSectionResponse>>> GetSectionById([FromRoute] string courseId, [FromRoute] string Id)
        {
            var command = new GetSectionByIdQuery(courseId = courseId, Id = Id);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("{courseId}/all")]
        public async Task<ActionResult<Response<List<GetSectionResponse>>>> GetAllSectionAsync([FromRoute] string courseId)
        {
            var response = await mediator.Send(new GetAllSectionQuery(courseId));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("section")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> AddSectionToCourseByIdAsync([FromBody] AddSectionRequest request)
        {
            var command = mapper.Map<AddSectionCommand>(request);
            command.providerId = GetUserId();
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);

        }
        [HttpPut("{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> EditSectionAsync([FromRoute] string Id, [FromBody] EditSectionRequest request)
        {

            var response = await mediator.Send(new EditSectionCommand()
            {
                Id = Id,
                providerId = GetUserId(),
                editSectionRequest = request
            });

            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("{courseId}/section/{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> Delete([FromRoute] string courseId, [FromRoute] string Id)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new DeleteSectionCommand(providerId ?? "", courseId, Id);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        }
    }
}
