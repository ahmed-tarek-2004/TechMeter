using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.DTO.LessonComment;
using TechMeter.Application.Features.Lesson.Command.AddLesson;
using TechMeter.Application.Features.Lesson.Command.ChangeLessonState;
using TechMeter.Application.Features.Lesson.Command.DeleteLesson;
using TechMeter.Application.Features.Lesson.Command.EditLesson;
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
    public class LessonController : ControllerBase
    {
        private readonly IMediator _mediator;
        public LessonController(
             ResponseHandler responseHandler, IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpPost("{sectionId}")]
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
        public async Task<ActionResult<Response<string>>> StudentLessonWatched([FromRoute] string Id)
        {
            var userId = GetUserId();
            var response = await _mediator.Send(new WatchLessonCommand { LessonId = Id, StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);
        }
        [EnableRateLimiting("TogglePolicy")]
        [HttpDelete("{Id}/unfinish")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<string>>> StudentLessonUnwatched([FromRoute] string Id)
        {
            var userId = GetUserId();
            var response = await _mediator.Send(new UnWatchLessonCommand { LessonId = Id, StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<GetLessonResponse>>> EditLessonByIdAsync([FromRoute] string Id, [FromForm] EditLessonRequest request)
        {
            var response = await _mediator.Send(new EditLessonCommand { Id = Id, EditLessonRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }
       
        [HttpGet("{Id}")]
        public async Task<ActionResult<Response<GetLessonResponse>>> GetLessonById(string Id)
        {
            var response = await _mediator.Send(new GetLessonByIdQuery { Id = Id });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("course/{courseId}/all")]
        public async Task<ActionResult<Response<List<GetLessonResponse>>>> GetCourseLessonsAsync(string courseId)
        {
            var response = await _mediator.Send(new GetCourseLessonsQuery(courseId));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/watched")]
        [Authorize(Roles="student")]
        public async Task<ActionResult<Response<List<GetLessonResponse>>>> GetStudentLessonWatchedAsync()
        {
            var userId = GetUserId();
            var response = await _mediator.Send(new StudentLessonWatchedQuery { StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);

        }
        [HttpGet("{sectionId}/lessons")]
        public async Task<ActionResult<Response<List<GetLessonResponse>>>> GetSectionLessonsAsync([FromRoute] string sectionId)
        {
            var response = await _mediator.Send(new GetSectionLessonsQuery { SectionId = sectionId });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}")]
        [Authorize(Roles = "provider,admin")]
        public async Task<ActionResult<Response<string>>> DeleteLessonByIdAsync([FromRoute] string Id)
        {
            var response = await _mediator.Send(new DeleteLessonCommand { Id = Id });
            return StatusCode((int)response.StatusCode, response);
        }
       
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
