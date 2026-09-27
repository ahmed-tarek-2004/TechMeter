using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Features.Lesson.Command.EditLessonOrder;
using TechMeter.Application.Features.Section.Command.AddSection;
using TechMeter.Application.Features.Section.Command.DeleteSection;
using TechMeter.Application.Features.Section.Command.EditSection;
using TechMeter.Application.Features.Section.Command.EditSectionOrder;
using TechMeter.Application.Features.Section.Query.GetAllSection;
using TechMeter.Application.Features.Section.Query.GetSectionById;
//using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Sections")]
    [Produces("application/json")]
    public class SectionController(IMediator mediator) : ControllerBase
    {

        [HttpGet("course/{courseId}/detail/{sectionId}")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Get section by ID",
            Description = "Requires JWT Bearer authentication. Returns the details of a specific section within a course.",
            OperationId = "Section_GetById",
            Tags = new[] { "Sections" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Section retrieved successfully", typeof(Response<GetSectionResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Section or course not found", typeof(Response<GetSectionResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetSectionResponse>>> GetSectionById([FromRoute] string courseId, [FromRoute] string sectionId)
        {
            var command = new GetSectionByIdQuery(courseId = courseId, sectionId = sectionId);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{courseId}/all")]
        [SwaggerOperation(
            Summary = "Get all sections for a course",
            Description = "Returns a list of all sections belonging to the specified course, ordered by their display order.",
            OperationId = "Section_GetAll",
            Tags = new[] { "Sections" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Sections retrieved successfully", typeof(Response<List<GetSectionResponse>>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Course not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetSectionResponse>>>> GetAllSectionAsync([FromRoute] string courseId)
        {
            var response = await mediator.Send(new GetAllSectionQuery(courseId));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("course/{courseId}")]
        [Authorize(Roles = "provider")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Add a section to a course",
            Description = "Requires JWT Bearer authentication with the provider role. Creates a new section inside the specified course owned by the authenticated provider.",
            OperationId = "Section_AddSection",
            Tags = new[] { "Sections" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Section created successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or course not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the course owner or lacks the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> AddSectionToCourseByIdAsync([FromRoute] string courseId, [FromBody] AddSectionRequest request)
        {
            var response = await mediator.Send(new AddSectionCommand(GetUserId(), courseId, request.SectionName));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{Id}")]
        [Authorize(Roles = "provider")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Edit a section",
            Description = "Requires JWT Bearer authentication with the provider role. Updates the name or details of an existing section owned by the authenticated provider.",
            OperationId = "Section_EditSection",
            Tags = new[] { "Sections" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Section updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or section not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the section owner or lacks the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
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
        [SwaggerOperation(
            Summary = "Delete a section",
            Description = "Requires JWT Bearer authentication with the provider role. Permanently deletes the specified section and all its lessons from the course.",
            OperationId = "Section_DeleteSection",
            Tags = new[] { "Sections" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Section deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Section or course not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the course owner or lacks the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> Delete([FromRoute] string courseId, [FromRoute] string Id)
        {
            var providerId = GetUserId();
            var command = new DeleteSectionCommand(providerId ?? "", courseId, Id);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{courseId}/reorder")]
        [Authorize(Roles = "provider")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Reorder sections in a course",
            Description = "Requires JWT Bearer authentication with the provider role. Updates the display order of sections within the specified course.",
            OperationId = "Section_ReorderSections",
            Tags = new[] { "Sections" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Section order updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid section IDs or course not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the course owner or lacks the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> EditLessonsOrderAsync([FromRoute] string courseId, [FromBody] EditSectionOrderRequest request)
        {
            var response = await mediator.Send(new EditSectionOrderCommand(request.sectionsId, courseId));
            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        }
    }
}
