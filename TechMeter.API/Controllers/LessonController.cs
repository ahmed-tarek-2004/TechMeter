using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Features.Lesson.Command.AddLesson;
using TechMeter.Application.Features.Lesson.Command.ChangeLessonState;
using TechMeter.Application.Features.Lesson.Command.DeleteLesson;
using TechMeter.Application.Features.Lesson.Command.EditLesson;
using TechMeter.Application.Features.Lesson.Query.GetAllLessons;
using TechMeter.Application.Features.Lesson.Query.GetLessonById;
using TechMeter.Application.Features.Lesson.Query.GetSectionLessons;
using TechMeter.Application.Features.Lesson.Query.StudentLessonWatched;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        public LessonController(
             ResponseHandler responseHandler, IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpPost("{sectionId}")]
        public async Task<ActionResult<GetLessonResponse>> AddLessonToSectionAsync([FromRoute] string sectionId, [FromForm] AddLessonRequest request)
        {

            var response = await _mediator.Send(new AddLessonCommand
            {
                SectionId = sectionId,
                request = request
            });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("student/{lessonId}/finish-unfinish")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<string>> StudentLessonWatched([FromRoute] string lessonId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(new ChangeLessonStateCommand { LessonId = lessonId, StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("{Id}")]
        public async Task<ActionResult<GetLessonResponse>> EditLEssonByIdAsync([FromRoute] string Id, [FromForm] EditLessonRequest request)
        {
            var response = await _mediator.Send(new EditLessonCommand { Id = Id, EditLessonRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("{Id}")]
        public async Task<ActionResult<GetLessonResponse>> GetLessonById(string Id)
        {
            var response = await _mediator.Send(new GetLessonByIdQuery { Id = Id });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<GetLessonResponse>>> GetAllLessonsAsync()
        {
            var response = await _mediator.Send(new GetAllLessonsQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/watched")]
        public async Task<ActionResult<List<GetLessonResponse>>> GetStudentLessonWatchedAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(new StudentLessonWatchedQuery { StudentId = userId! });
            return StatusCode((int)response.StatusCode, response);

        }
        [HttpGet("{sectionId}/lessons")]
        public async Task<ActionResult<List<GetLessonResponse>>> GetAllLessonsAsync([FromRoute] string sectionId)
        {
            var response = await _mediator.Send(new GetSectionLessonsQuery { SectionId = sectionId });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("{Id}")]
        public async Task<ActionResult<Response<string>>> DeleteLessonByIdAsync(string Id)
        {
            var response = await _mediator.Send(new DeleteLessonCommand { Id = Id });
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
