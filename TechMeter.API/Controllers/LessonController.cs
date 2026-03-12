using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<AddLessonRequest> _addLessonRequest;
        private readonly IValidator<EditLessonRequest> _editLessonRequest;
        public LessonController(ILessonService lessonService, IValidator<EditLessonRequest> editLessonRequest,
            IValidator<AddLessonRequest> addLessonRequest, ResponseHandler responseHandler)
        {
            _lessonService = lessonService;
            _editLessonRequest = editLessonRequest;
            _addLessonRequest = addLessonRequest;
            _responseHandler = responseHandler;
        }

        [HttpPost("add/lesson/to-section/{sectionId}")]
        public async Task<ActionResult<GetLessonResponse>> AddLessonToSectionAsync([FromRoute] string sectionId, [FromForm] AddLessonRequest request)
        {
            var validation = await _addLessonRequest.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Error = string.Join(", ", validation.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(Error));
            }
            var response = await _lessonService.AddLessonAsync(sectionId, request);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("student/{lessonId}/finish/lesson")]
        public async Task<ActionResult<GetLessonResponse>> StudentLessonWatched([FromRoute] string lessonId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _lessonService.StudentLessonWatched(userId!, lessonId);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("edit/lesson/detail/by/{Id}")]
        public async Task<ActionResult<GetLessonResponse>> EditLEssonByIdAsync([FromRoute] string Id, [FromForm] EditLessonRequest request)
        {
            var validation = await _editLessonRequest.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var Error = string.Join(", ", validation.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)HttpStatusCode.BadRequest, _responseHandler.BadRequest<object>(Error));
            }
            var response = await _lessonService.EditLessonAsync(Id, request);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("lesson/by/{Id}")]
        public async Task<ActionResult<GetLessonResponse>> GetLessonById(string Id)
        {
            var response = await _lessonService.GetLessonByIdAsync(Id);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("all/lesson")]
        public async Task<ActionResult<List<GetLessonResponse>>> GetAllLessonsAsync()
        {
            var response = await _lessonService.GetALLessonAsync();
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/lesson-watched")]
        public async Task<ActionResult<List<GetLessonResponse>>> GetStudentLessonWatchedAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _lessonService.GetStudentLessonWatched(userId!);
            return StatusCode((int)response.StatusCode, response);

        }
        [HttpGet("section/lesson/{sectionId}")]
        public async Task<ActionResult<List<GetLessonResponse>>> GetAllLessonsAsync([FromRoute]string sectionId)
        {
            var response = await _lessonService.GetSectionLessonResponse(sectionId);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("delete/lesson/by/{Id}")]
        public async Task<ActionResult<List<GetLessonResponse>>> DeleteLwssonByIdAsync(string Id)
        {
            var response = await _lessonService.DeleteLessonAsync(Id);
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
