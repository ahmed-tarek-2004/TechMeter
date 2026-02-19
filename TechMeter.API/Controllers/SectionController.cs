using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionController : ControllerBase
    {
        private readonly ISectionService _sectionService;
        private readonly IValidator<AddSectionRequest> _addSectionRequestValidator;
        private readonly IValidator<EditSectionRequest> _editSectionRequestValidator;
        private readonly ResponseHandler _responseHandler;
        public SectionController(ISectionService sectionService, IValidator<AddSectionRequest> addSectionRequestValidator
            , ResponseHandler responseHandler, IValidator<EditSectionRequest> editSectionRequestValidator)
        {
            _sectionService = sectionService;
            _addSectionRequestValidator = addSectionRequestValidator;
            _responseHandler = responseHandler;
            _editSectionRequestValidator = editSectionRequestValidator;
        }
        [HttpGet("provider/{providerId}/course/{courseId}/get-section/{Id}")]
        public async Task<ActionResult<Response<GetSectionResponse>>> GetSectionByIdAsync([FromRoute] GetSectionRequest request)
        {
            var response = await _sectionService.GetSectionByIdAsync(request.ProviderId, request.CourseId, request.Id);
            return StatusCode((int)response.StatusCode, response);
        }
        //public async Task<ActionResult<Response<GetSectionResponse>>> GetSectionById([FromRoute]string providerId,[FromRoute]string courseId, [FromRoute]string Id)
        //{
        //    var response = await _sectionService.GetSectionByIdAsync(providerId, courseId, Id);
        //    return StatusCode((int)response.StatusCode, response);
        //}
        [HttpGet("provider/{providerId}/course/{courseId}/get-all/sections")]
        public async Task<ActionResult<Response<List<GetSectionResponse>>>> GetAllSectionAsync([FromRoute] string providerId, string courseId)
        {
            var response = await _sectionService.GetAllCourseSectionsAsync(providerId, courseId);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("add-section")]
        public async Task<ActionResult<Response<AddSectionResponse>>> AddSectionToCourseByIdAsync([FromBody] AddSectionRequest request)
        {

            var validationResult = await _addSectionRequestValidator.ValidateAsync(request);
            if (validationResult.IsValid)
            {
                var error = string.Join(", ", validationResult.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(error).StatusCode, _responseHandler.BadRequest<object>(error));
            }

            var providerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _sectionService.AddSectionAsync(providerId!, request);

            return StatusCode((int)response.StatusCode, response);

        }
        [HttpPut("edit/section/{Id}")]
        public async Task<ActionResult<Response<GetSectionResponse>>> EditSectionAsync([FromBody] EditSectionRequest request)
        {
            var validationResult = await _editSectionRequestValidator.ValidateAsync(request);
            if (validationResult.IsValid)
            {
                var error = string.Join(", ", validationResult.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(error).StatusCode, _responseHandler.BadRequest<object>(error));
            }

            var providerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _sectionService.EditSectionAsync(providerId!, request);

            return StatusCode((int)response.StatusCode, request);
        }
        [HttpDelete("course/{courseId}/section/{Id}")]
        public async Task<ActionResult<Response<string>>> Delete([FromRoute]string courseId,string Id)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _sectionService.DeleteSectionByIdAsync(providerId!,courseId,Id);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
