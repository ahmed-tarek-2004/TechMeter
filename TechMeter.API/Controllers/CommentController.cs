using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Features.Lesson.Command.AddLessonComment;
using TechMeter.Application.Features.Lesson.Command.DeleteLessonComment;
using TechMeter.Application.Features.Lesson.Command.EditLessonComment;
using TechMeter.Application.Features.Lesson.Query.GetLessonComments;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController(IMediator mediator) : ControllerBase
    {

        [HttpPost("{lessonId}")]
        public async Task<ActionResult<Response<LessonCommentResponse>>> AddCommentToLesson([FromRoute] string lessonId, [FromBody] string content)
        {
            var response = await mediator.Send(new AddLessonCommentCommand(GetUserId(), lessonId, content));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}/lesson/{lessonId}")]
        [Authorize(Roles = "provider,admin")]
        public async Task<ActionResult<Response<string>>> DeleteLessonCommentByIdAsync([FromRoute] string lessonId, [FromRoute] string Id)
        {
            var response = await mediator.Send(new DeleteLessonCommentCommand(lessonId, Id, GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{lessonId}")]
        public async Task<ActionResult<Response<List<LessonCommentResponse>>>> GetLessonCommentsAsync([FromRoute] string Id)
        {
            var response = await mediator.Send(new GetLessonCommentsQuery(GetUserId(), Id));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPatch("{Id}/lesson/{lesosnId}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<LessonCommentResponse>>> EditLessonCommentByIdAsync([FromRoute] string Id, [FromRoute] string lessonId, [FromBody] LessonCommentRequest request)
        {
            var response = await mediator.Send(new EditLessonCommentCommand(lessonId,Id, GetUserId(), request.Content));
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
