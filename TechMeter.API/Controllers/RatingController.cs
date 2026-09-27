using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Command.AddStudentRating;
using TechMeter.Application.Features.Rating.Command.DeleteStudentRating;
using TechMeter.Application.Features.Rating.Command.EditStudentRating;
using TechMeter.Application.Features.Rating.Query.GetProviderAllCourseRating;
using TechMeter.Application.Features.Rating.Query.GetStudentRating;
//using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Ratings")]
    [Produces("application/json")]
    public class RatingController : ControllerBase
    {
        private readonly IMediator _mediator;
        public RatingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("student")]
        [Authorize(Roles = "student")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Add rating to a course",
            Description = "Requires JWT Bearer authentication with the student role. Submits a star rating and optional review text for a course the student is enrolled in.",
            OperationId = "Rating_AddRating",
            Tags = new[] { "Ratings" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Rating added successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Student already rated this course or is not enrolled", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> AddStudentRatingToCourse([FromBody] AddStudentRatingRequest request)
        {
            var response = await _mediator.Send(new AddStudentRatingCommand()
            {
                studentId = GetUserId(),
                addStudentRatingRequest = request
            });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("student")]
        [Authorize(Roles = "student")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Edit student course rating",
            Description = "Requires JWT Bearer authentication with the student role. Updates the authenticated student's existing rating for a course.",
            OperationId = "Rating_EditRating",
            Tags = new[] { "Ratings" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Rating updated successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Rating not found or validation failure", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> EditStudentRating([FromBody] EditStudentRatingRequest request)
        {
            var response = await _mediator.Send(new EditStudentRatingCommand()
            {
                StudentId = GetUserId(),
                editStudentRatingRequest = request
            });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/{CourseId}")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Get student's rating for a course",
            Description = "Requires JWT Bearer authentication with the student role. Returns the authenticated student's rating for the specified course.",
            OperationId = "Rating_GetStudentRating",
            Tags = new[] { "Ratings" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Student rating retrieved successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Rating not found for this course")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> StudentGetCourseRating([FromRoute] string CourseId)
        {
            var query = new GetStudentCourseRatingQuery(GetUserId(), CourseId);
            var response = await _mediator.Send(query);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("all/{CourseId}")]
        [Authorize]
        [SwaggerOperation(
            Summary = "Get all ratings for a course",
            Description = "Requires JWT Bearer authentication. Returns all ratings and reviews submitted for the specified course.",
            OperationId = "Rating_GetAllCourseRatings",
            Tags = new[] { "Ratings" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course ratings retrieved successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Course not found")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> GetAllCourseRating([FromRoute] string CourseId)
        {
            var query = new GetProviderAllCourseRatingQuery(GetUserId(), CourseId);
            var response = await _mediator.Send(query);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("student/{CourseId}")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Delete student rating",
            Description = "Requires JWT Bearer authentication with the student role. Removes the authenticated student's rating from the specified course.",
            OperationId = "Rating_DeleteStudentRating",
            Tags = new[] { "Ratings" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Rating deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Rating not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> StudentDeleteRating([FromRoute] string CourseId)
        {
            var command = new DeleteStudentRatingCommand(GetUserId(), CourseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("admin/{studentId}/rating/{courseId}")]
        [Authorize(Roles = "admin")]
        [SwaggerOperation(
            Summary = "Delete a rating (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Allows an admin to remove any student's rating from a course.",
            OperationId = "Rating_AdminDeleteRating",
            Tags = new[] { "Ratings" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Rating deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Rating not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> AdminDeleteRating([FromRoute] string studentId, [FromRoute] string courseId)
        {
            var command = new DeleteStudentRatingCommand(studentId, courseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
