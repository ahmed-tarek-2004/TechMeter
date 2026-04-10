using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.API.Validators;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Course.Command.DeleteCourse;
using TechMeter.Application.Features.Course.Query.GetAllCourse;
using TechMeter.Application.Features.Course.Query.GetCategoryById;
using TechMeter.Application.Features.Course.Query.GetProviderCourses;
using TechMeter.Application.Features.Course.Query.GetStudentCourses;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        public IMediator _mediator;
        private readonly ICourseService _courseService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<AddCourseRequest> _addCourseValidator;
        private readonly IValidator<EditCourseRequest> _editCourseValidator;

        public CourseController(IMediator mediator, ICourseService courseService, ResponseHandler responseHandler,
            IValidator<AddCourseRequest> addCourseValidator, IValidator<EditCourseRequest> editCourseValidator)
        {
            _mediator = mediator;
            _courseService = courseService;
            _responseHandler = responseHandler;
            _addCourseValidator = addCourseValidator;
            _editCourseValidator = editCourseValidator;
        }

        [HttpGet("all/course")]
        public async Task<ActionResult<Response<List<GetCourseResponse>>>> GetAll()
        {
            var response = await _mediator.Send(new GetAllCoursesQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("course/by/{Id}")]
        public async Task<ActionResult<Response<GetCourseResponse>>> GetCourseByIdAsync(string Id)
        {
            var response = await _mediator.Send(new GetCourseByIdQuery(Id));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("provider/courses")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<List<GetCourseResponse>>>> GetProviderCoursesAsync()
        {
            var response = await _mediator.Send(new GetProviderCoursesQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ""));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/courses")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<List<GetStudentCourseResponse>>>> GetStudentCoursesAsync()
        {
            var response = await _mediator.Send(new GetStudentCoursesQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ""));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("add")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<AddCourseResponse>>> Create([FromForm] AddCourseRequest request)
        {
            var validationResult = await _addCourseValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _courseService.AddCourseAsync(providerId!, request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("edit/{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<object>>> Update(string Id, [FromForm] EditCourseRequest request)
        {
            var validationResult = await _editCourseValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }

            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _courseService.EditCourseAsync(providerId!, Id, request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = "admin,provider")]
        public async Task<ActionResult<Response<string>>> Delete(string courseId)
        {
            var responsiableId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(new DeleteCourseCommand(responsiableId!, courseId));
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
