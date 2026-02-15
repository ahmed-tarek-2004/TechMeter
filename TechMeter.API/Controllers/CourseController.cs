using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.API.Validators;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.CourseService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<AddCourseRequest> _addCourseValidator;
        private readonly IValidator<EditCourseRequest> _editCourseValidator;

        public CourseController(ICourseService courseService, ResponseHandler responseHandler,
            IValidator<AddCourseRequest> addCourseValidator, IValidator<EditCourseRequest> editCourseValidator)
        {
            _courseService = courseService;
            _responseHandler = responseHandler;
            _addCourseValidator = addCourseValidator;
            _editCourseValidator = editCourseValidator;
        }

        [HttpGet]
        public async Task<ActionResult<Response<IEnumerable<GetCourseResponse>>>> GetAll()
        {
            var response = await _courseService.GetCoursesAsync();
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{Id}")]
        public async Task<ActionResult<Response<GetCourseResponse>>> GetById(string Id)
        {
            var response = await _courseService.GetCourseByIdAsync(Id);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("add")]
        public async Task<ActionResult<Response<AddCourseResponse>>> Create([FromBody] AddCourseRequest request)
        {
            var validationResult = await _addCourseValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _courseService.AddCourseAsync(providerId!,request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Response<object>>> Update(string id, [FromBody] EditCourseRequest request)
        {
            var validationResult = await _editCourseValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var response = await _courseService.EditCourseAsync(id, request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{CourseId}")]
        public async Task<ActionResult<Response<string>>> Delete(string CourseId)
        {
            var responsiableId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _courseService.DeleteCourseByIdAsync(responsiableId!,CourseId);
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
