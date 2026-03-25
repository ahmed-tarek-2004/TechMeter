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
    public class SectionController : ControllerBase
    {

        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly ResponseHandler _responseHandler;
        public SectionController(ISectionService sectionService, IMediator mediator, IMapper mapper
            , ResponseHandler responseHandler)
        {
            _responseHandler = responseHandler;
            _mediator = mediator;
            _mapper = mapper;
        }
        [HttpGet("course/{courseId}/get-section-detail/{Id}")]
        [Authorize]
        public async Task<ActionResult<Response<GetSectionResponse>>> GetSectionById([FromRoute] string courseId, [FromRoute] string Id)
        {
            var command = new GetSectionByIdQuery(courseId = courseId, Id = Id);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("course/{courseId}/get-all/sections")]
        public async Task<ActionResult<Response<List<GetSectionResponse>>>> GetAllSectionAsync([FromRoute] string courseId)
        {
            var response = await _mediator.Send(new GetAllSectionQuery(courseId));
            return StatusCode((int)response.StatusCode, response);
        }



        [HttpPost("add-section")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> AddSectionToCourseByIdAsync([FromBody] AddSectionRequest request)
        {

            var command = _mapper.Map<AddSectionCommand>(request);
            command.providerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);

        }
        [HttpPut("edit/section/{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> EditSectionAsync([FromRoute] string Id, [FromBody] EditSectionRequest request)
        {
            var command = _mapper.Map<EditSectionCommand>(request);
            command.providerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
            command.Id = Id;
            var response = await _mediator.Send(command);

            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("course/{courseId}/section/{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> Delete([FromRoute] string courseId, [FromRoute] string Id)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new DeleteSectionCommand(providerId ?? "", courseId, Id);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
