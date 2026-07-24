using Azure.Core;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Features.Lesson.Command.AddLessonComment;
using TechMeter.Application.Features.Lesson.Command.DeleteLessonComment;
using TechMeter.Application.Features.Lesson.Command.EditLessonComment;
using TechMeter.Application.Features.Lesson.Command.LikeOnLessonComment;
using TechMeter.Application.Features.Lesson.Query.GetLessonComments;
using TechMeter.Application.Features.Lesson.Query.GetLessonsCommentLikes;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController(IMediator mediator) : ControllerBase
    {

        [HttpPatch("{Id}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<LessonCommentResponse>>> EditLessonCommentByIdAsync([FromRoute] string Id, [FromBody] LessonCommentRequest request)
        {
            var response = await mediator.Send(new EditLessonCommentCommand(Id, GetUserId(), request.Content));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("{lessonId}")]
        [Authorize(Roles ="provider")]
        public async Task<ActionResult<Response<LessonCommentResponse>>> AddCommentToLesson([FromRoute] string lessonId, [FromBody] LessonCommentRequest request)
        {
            var response = await mediator.Send(new AddLessonCommentCommand(GetUserId(), lessonId, request.Content,request.ParentCommentId!));
            return StatusCode((int)response.StatusCode, response);
        }


        [HttpPost("{Id}/like")]
        [Authorize]
        [EnableRateLimiting("TogglePolicy")]
        public async Task<ActionResult<Response<string>>> LikeCommentToLesson([FromRoute] string Id)
        {
            var response = await mediator.Send(new LikeOnLessonCommentCommand(Id, GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("{Id}/like")]
        [Authorize]
        [EnableRateLimiting("TogglePolicy")]
        public async Task<ActionResult<Response<string>>> UnLikeCommentToLesson([FromRoute] string Id)
        {
            var response = await mediator.Send(new UnLikeOnLessonCommentCommand(Id, GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}/lesson/{lessonId}")]

        [Authorize]
        public async Task<ActionResult<Response<string>>> DeleteLessonCommentByIdAsync([FromRoute] string lessonId, [FromRoute] string Id)
        {
            var response = await mediator.Send(new DeleteLessonCommentCommand(lessonId, Id, GetUserId(), IsInRole()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{lessonId}/all")]
        [Authorize]
        public async Task<ActionResult<Response<List<LessonCommentResponse>>>> GetLessonCommentsAsync([FromRoute] string lessonId)
        {
            var response = await mediator.Send(new GetLessonCommentsQuery(GetUserId(), lessonId,IsInRole()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{Id}/likes")]
        [Authorize]
        public async Task<ActionResult<Response<List<LessonCommentLikesResponse>>>> GetLessonCommentsLikesAsync([FromRoute] string Id)
        {
            var response = await mediator.Send(new GetLessonsCommentLikesQuery(Id, GetUserId(),IsInRole()));
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
