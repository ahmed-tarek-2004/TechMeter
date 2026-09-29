using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.API.Hubs;
using TechMeter.API.Validators;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Course.Command.AddCourse;
using TechMeter.Application.Features.Course.Command.DeleteCourse;
using TechMeter.Application.Features.Course.Command.EditCourse;
using TechMeter.Application.Features.Course.Command.ProviderPublishCourse;
using TechMeter.Application.Features.Course.Query.GetAllCourse;
using TechMeter.Application.Features.Course.Query.GetCategoryById;
using TechMeter.Application.Features.Course.Query.GetProviderCourses;
using TechMeter.Application.Features.Course.Query.GetStudentCourseById;
using TechMeter.Application.Features.Course.Query.GetStudentCourses;
//using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Courses")]
    [Produces("application/json")]
    public class CourseController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CourseController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("all")]
        [SwaggerOperation(
            Summary = "Get all courses",
            Description = "Returns a list of all published courses available on the platform.",
            OperationId = "Course_GetAll",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Courses retrieved successfully", typeof(Response<List<GetCourseResponse>>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetCourseResponse>>>> GetAll()
        {
            var response = await _mediator.Send(new GetAllCoursesQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{Id}")]
        [SwaggerOperation(
            Summary = "Get course by ID",
            Description = "Returns the public details of a single course identified by its unique ID.",
            OperationId = "Course_GetById",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course retrieved successfully", typeof(Response<GetCourseResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Course not found", typeof(Response<GetCourseResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetCourseResponse>>> GetCourseByIdAsync(string Id)
        {
            var response = await _mediator.Send(new GetCourseByIdQuery(Id));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("provider")]
        [Authorize(Roles = "provider")]
        [SwaggerOperation(
            Summary = "Get provider's own courses",
            Description = "Requires JWT Bearer authentication with the provider role. Returns all courses created by the authenticated provider.",
            OperationId = "Course_GetProviderCourses",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Provider courses retrieved successfully", typeof(Response<List<GetCourseResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetCourseResponse>>>> GetProviderCoursesAsync()
        {
            var response = await _mediator.Send(new GetProviderCoursesQuery(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Get enrolled student courses",
            Description = "Requires JWT Bearer authentication with the student role. Returns all courses the authenticated student is currently enrolled in.",
            OperationId = "Course_GetStudentCourses",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Student courses retrieved successfully", typeof(Response<List<GetStudentCourseResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetStudentCourseResponse>>>> GetStudentCoursesAsync()
        {
            var response = await _mediator.Send(new GetStudentCoursesQuery(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/{courseId}/learn")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Get enrolled course learning details",
            Description = "Requires JWT Bearer authentication with the student role. Returns the full learning details (sections, lessons, progress) for a specific enrolled course.",
            OperationId = "Course_GetStudentCourseById",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course learning details retrieved successfully", typeof(Response<GetStudentCourseResponse>))]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "Student is not enrolled in this course")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Course not found", typeof(Response<GetStudentCourseResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetStudentCourseResponse>>> GetStudentCoursesByIdAsync([FromRoute] string courseId)
        {
            var response = await _mediator.Send(new GetStudentCourseByIdCommand(GetUserId(), courseId));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost]
        [Authorize(Roles = "provider")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Create a new course",
            Description = "Requires JWT Bearer authentication with the provider role. Creates a new course with thumbnail upload to Cloudinary.",
            OperationId = "Course_Create",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course created successfully", typeof(Response<AddCourseResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure", typeof(Response<AddCourseResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<AddCourseResponse>>> Create([FromForm] AddCourseRequest request)
        {
            var response = await _mediator.Send(new AddCourseCommand { providerId = GetUserId(), addCourseRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{courseId}")]
        [Authorize(Roles = "provider")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
            Summary = "Update a course",
            Description = "Requires JWT Bearer authentication with the provider role. Updates the details and optional thumbnail of an existing course owned by the authenticated provider.",
            OperationId = "Course_Update",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or course not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the course owner or lacks the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> Update([FromRoute] string courseId, [FromForm] EditCourseRequest request)
        {
            var response = await _mediator.Send(new EditCourseCommand { courseId = courseId, providerId = GetUserId(), editCourseRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = "admin,provider")]
        [SwaggerOperation(
            Summary = "Delete a course",
            Description = "Requires JWT Bearer authentication with the admin or provider role. Permanently deletes the specified course and all its associated sections and lessons.",
            OperationId = "Course_Delete",
            Tags = new[] { "Courses" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Course not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin or provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> Delete(string courseId)
        {
            var responsiableId = GetUserId();
            var response = await _mediator.Send(new DeleteCourseCommand(responsiableId!, courseId));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("provider/submit/{courseId}")]
        [Authorize]
        public async Task<ActionResult<Response<string>>> ProviderSubmitANewCourseAsync([FromRoute] string courseId)
        {
            var response = await _mediator.Send(new ProviderPublishCourseCommand(courseId, GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
