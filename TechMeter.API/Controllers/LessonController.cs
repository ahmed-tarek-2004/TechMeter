using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Swashbuckle.AspNetCore.Annotations;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Features.Lesson.Command;
using TechMeter.Application.Features.Lesson.Command.AddLesson;
using TechMeter.Application.Features.Lesson.Command.ChangeLessonState;
using TechMeter.Application.Features.Lesson.Command.DeleteLesson;
using TechMeter.Application.Features.Lesson.Command.EditLesson;
using TechMeter.Application.Features.Lesson.Command.EditLessonOrder;
using TechMeter.Application.Features.Lesson.Command.UnWatchLesson;
using TechMeter.Application.Features.Lesson.Query.GetAllLessons;
using TechMeter.Application.Features.Lesson.Query.GetLessonById;
using TechMeter.Application.Features.Lesson.Query.GetSectionLessons;
using TechMeter.Application.Features.Lesson.Query.StudentLessonWatched;
//using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Lessons")]
    [Produces("application/json")]
    public class LessonController : ControllerBase
    {
        private readonly IMediator _mediator;
        public LessonController(
             ResponseHandler responseHandler, IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{sectionId}")]
        [Authorize(Roles = "provider")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Add a lesson to a section",
            Description = "Requires JWT Bearer authentication with the provider role. Creates a new lesson inside the specified section, including video upload.",
            OperationId = "Lesson_AddLesson",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson created successfully", typeof(Response<GetLessonResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or section not found", typeof(Response<GetLessonResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetLessonResponse>>> AddLessonToSectionAsync([FromRoute] string sectionId, [FromForm] AddLessonRequest request)
        {
            var response = await _mediator.Send(new AddLessonCommand
            {
                SectionId = sectionId,
                AddLessonRequest = request
            });
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("TogglePolicy")]
        [HttpPost("{Id}/finish")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Mark lesson as watched",
            Description = "Requires JWT Bearer authentication with the student role. Marks the specified lesson as completed for the authenticated student. Rate-limited by TogglePolicy.",
            OperationId = "Lesson_MarkWatched",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson marked as watched", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Lesson already marked or not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> StudentLessonWatched([FromRoute] string Id)
        {
            var userId = GetUserId();
            var response = await _mediator.Send(new WatchLessonCommand { LessonId = Id, StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);
        }

        [EnableRateLimiting("TogglePolicy")]
        [HttpDelete("{Id}/unfinish")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Mark lesson as unwatched",
            Description = "Requires JWT Bearer authentication with the student role. Removes the watched status from the specified lesson for the authenticated student. Rate-limited by TogglePolicy.",
            OperationId = "Lesson_MarkUnwatched",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson marked as unwatched", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Lesson not watched or not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> StudentLessonUnwatched([FromRoute] string Id)
        {
            var userId = GetUserId();
            var response = await _mediator.Send(new UnWatchLessonCommand { LessonId = Id, StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{Id}")]
        [Authorize(Roles = "provider")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Edit a lesson",
            Description = "Requires JWT Bearer authentication with the provider role. Updates the details and optional video of an existing lesson.",
            OperationId = "Lesson_EditLesson",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson updated successfully", typeof(Response<GetLessonResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or lesson not found", typeof(Response<GetLessonResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetLessonResponse>>> EditLessonByIdAsync([FromRoute] string Id, [FromForm] EditLessonRequest request)
        {
            var response = await _mediator.Send(new EditLessonCommand { Id = Id, EditLessonRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{Id}")]
        [SwaggerOperation(
            Summary = "Get lesson by ID",
            Description = "Returns the details of a specific lesson by its unique ID.",
            OperationId = "Lesson_GetById",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson retrieved successfully", typeof(Response<GetLessonResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Lesson not found", typeof(Response<GetLessonResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetLessonResponse>>> GetLessonById(string Id)
        {
            var response = await _mediator.Send(new GetLessonByIdQuery { Id = Id });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("course/{courseId}/all")]
        [SwaggerOperation(
            Summary = "Get all lessons for a course",
            Description = "Returns a list of all lessons belonging to the specified course.",
            OperationId = "Lesson_GetCourseLessons",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lessons retrieved successfully", typeof(Response<List<GetLessonResponse>>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Course not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetLessonResponse>>>> GetCourseLessonsAsync(string courseId)
        {
            var response = await _mediator.Send(new GetCourseLessonsQuery(courseId));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/watched")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Get lessons watched by student",
            Description = "Requires JWT Bearer authentication with the student role. Returns all lessons the authenticated student has marked as watched.",
            OperationId = "Lesson_GetStudentWatched",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Watched lessons retrieved successfully", typeof(Response<List<GetLessonResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetLessonResponse>>>> GetStudentLessonWatchedAsync()
        {
            var userId = GetUserId();
            var response = await _mediator.Send(new StudentLessonWatchedQuery { StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{sectionId}/lessons")]
        [SwaggerOperation(
            Summary = "Get all lessons in a section",
            Description = "Returns all lessons belonging to the specified section.",
            OperationId = "Lesson_GetSectionLessons",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Section lessons retrieved successfully", typeof(Response<List<GetLessonResponse>>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Section not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetLessonResponse>>>> GetSectionLessonsAsync([FromRoute] string sectionId)
        {
            var response = await _mediator.Send(new GetSectionLessonsQuery { SectionId = sectionId });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}")]
        [Authorize(Roles = "provider,admin")]
        [SwaggerOperation(
            Summary = "Delete a lesson",
            Description = "Requires JWT Bearer authentication with the provider or admin role. Permanently deletes the specified lesson.",
            OperationId = "Lesson_DeleteLesson",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Lesson not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider or admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> DeleteLessonByIdAsync([FromRoute] string Id)
        {
            var response = await _mediator.Send(new DeleteLessonCommand { Id = Id });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{sectionId}/reorder")]
        [Authorize(Roles = "provider")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Reorder lessons in a section",
            Description = "Requires JWT Bearer authentication with the provider role. Updates the display order of lessons within the specified section.",
            OperationId = "Lesson_ReorderLessons",
            Tags = new[] { "Lessons" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Lesson order updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid lesson IDs or section not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> EditLessonsOrderAsync([FromRoute] string sectionId, [FromBody] EditLessonOrderRequest request)
        {
            var response = await _mediator.Send(new EditLessonOrderCommand(request.LessonsId, sectionId));
            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
