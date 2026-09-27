using Azure.Core;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Features.Comments.Command.AddComment;
using TechMeter.Application.Features.Comments.Command.DeleteComment;
using TechMeter.Application.Features.Comments.Command.EditComment;
using TechMeter.Application.Features.Comments.Command.LikeOnComment;
using TechMeter.Application.Features.Comments.Command.UnLikeOnComment;
using TechMeter.Application.Features.Comments.Query.GetCommentLike;
using TechMeter.Application.Features.Comments.Query.GetLessonComments;
using TechMeter.Application.Features.Lesson.Command.EditLesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    [Tags("Comments")]
    [Produces("application/json")]
    public class CommentsController(IMediator mediator) : ControllerBase
    {

        [HttpPatch("{Id}")]
        [SwaggerOperation(
            Summary = "Edit a lesson comment",
            Description = "Requires JWT Bearer authentication. Updates the content of the specified comment. Only the original author can edit their comment.",
            OperationId = "Comments_EditComment",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comment updated successfully", typeof(Response<LessonCommentResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or comment not found", typeof(Response<LessonCommentResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the author of this comment")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<LessonCommentResponse>>> EditLessonCommentByIdAsync([FromRoute] string Id, [FromBody] LessonCommentRequest request)
        {
            var response = await mediator.Send(new EditCommentCommand(Id, GetUserId(), request.Content));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("{lessonId}")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Add a comment to a lesson",
            Description = "Requires JWT Bearer authentication. Posts a new top-level comment or a threaded reply (set ParentCommentId) to the specified lesson.",
            OperationId = "Comments_AddComment",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comment added successfully", typeof(Response<LessonCommentResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or lesson not found", typeof(Response<LessonCommentResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<LessonCommentResponse>>> AddCommentToLesson([FromRoute] string lessonId, [FromBody] LessonCommentRequest request)
        {
            var response = await mediator.Send(new AddCommentCommand(GetUserId(), lessonId, request.Content, request.ParentCommentId!));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("{Id}/like")]
        [EnableRateLimiting("TogglePolicy")]
        [SwaggerOperation(
            Summary = "Like a comment",
            Description = "Requires JWT Bearer authentication. Adds a like from the authenticated user to the specified comment. Rate-limited by TogglePolicy.",
            OperationId = "Comments_LikeComment",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comment liked successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Comment already liked or not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> LikeCommentToLesson([FromRoute] string Id)
        {
            var response = await mediator.Send(new LikeOnCommentCommand(Id, GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}/like")]
        [EnableRateLimiting("TogglePolicy")]
        [SwaggerOperation(
            Summary = "Unlike a comment",
            Description = "Requires JWT Bearer authentication. Removes the authenticated user's like from the specified comment. Rate-limited by TogglePolicy.",
            OperationId = "Comments_UnlikeComment",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comment unliked successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Like not found or comment not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status429TooManyRequests, "Rate limit exceeded")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> UnLikeCommentToLesson([FromRoute] string Id)
        {
            var response = await mediator.Send(new UnLikeOnCommentCommand(Id, GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}/lesson/{lessonId}")]
        [SwaggerOperation(
            Summary = "Delete a lesson comment",
            Description = "Requires JWT Bearer authentication. Deletes the specified comment. Authors can delete their own comments; admins can delete any comment.",
            OperationId = "Comments_DeleteComment",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comment deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Comment not found or unauthorized", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User is not the author or an admin")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> DeleteLessonCommentByIdAsync([FromRoute] string lessonId, [FromRoute] string Id)
        {
            var response = await mediator.Send(new DeleteCommentCommand(lessonId, Id, GetUserId(), IsInRole()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{lessonId}/all")]
        [SwaggerOperation(
            Summary = "Get all comments for a lesson",
            Description = "Requires JWT Bearer authentication. Returns all top-level comments and replies for the specified lesson.",
            OperationId = "Comments_GetLessonComments",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comments retrieved successfully", typeof(Response<List<LessonCommentResponse>>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Lesson not found")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<LessonCommentResponse>>>> GetLessonCommentsAsync([FromRoute] string lessonId)
        {
            var response = await mediator.Send(new GetAllLessonCommentQuery(GetUserId(), lessonId, IsInRole()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{Id}/likes")]
        [SwaggerOperation(
            Summary = "Get likes for a comment",
            Description = "Requires JWT Bearer authentication. Returns the list of users who liked the specified comment.",
            OperationId = "Comments_GetCommentLikes",
            Tags = new[] { "Comments" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Comment likes retrieved successfully", typeof(Response<List<LessonCommentLikesResponse>>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Comment not found")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<LessonCommentLikesResponse>>>> GetLessonCommentsLikesAsync([FromRoute] string Id)
        {
            var response = await mediator.Send(new GetCommentLikesQuery(Id, GetUserId(), IsInRole()));
            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }

        private bool IsInRole()
        {
            return User.IsInRole("admin");
        }
    }
}
