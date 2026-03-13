using FluentValidation;
using Microsoft.AspNetCore.Authorization;
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
        [HttpGet("course/{courseId}/get-section-detail/{Id}")]
        [Authorize]
        public async Task<ActionResult<Response<GetSectionResponse>>> GetSectionById([FromRoute] string courseId, [FromRoute] string Id)
        {
            //var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _sectionService.GetSectionDetailedByIdAsync(courseId, Id);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("course/{courseId}/get-all/sections")]
        public async Task<ActionResult<Response<List<GetSectionResponse>>>> GetAllSectionAsync([FromRoute] string courseId)
        {
            //var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _sectionService.GetAllCourseSectionsAsync(courseId);
            return StatusCode((int)response.StatusCode, response);
        }

        

        [HttpPost("add-section")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<AddSectionResponse>>> AddSectionToCourseByIdAsync([FromBody] AddSectionRequest request)
        {

            var validationResult = await _addSectionRequestValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var error = string.Join(", ", validationResult.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(error).StatusCode, _responseHandler.BadRequest<object>(error));
            }

            var providerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _sectionService.AddSectionAsync(providerId!, request);

            return StatusCode((int)response.StatusCode, response);

        }
        [HttpPut("edit/section/{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<GetSectionResponse>>> EditSectionAsync([FromRoute]string Id,[FromBody] EditSectionRequest request)
        {
            var validationResult = await _editSectionRequestValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var error = string.Join(", ", validationResult.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(error).StatusCode, _responseHandler.BadRequest<object>(error));
            }

            var providerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _sectionService.EditSectionAsync(providerId!,Id, request);

            return StatusCode((int)response.StatusCode, request);
        }
        [HttpDelete("course/{courseId}/section/{Id}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> Delete([FromRoute] string courseId, string Id)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _sectionService.DeleteSectionByIdAsync(providerId!, courseId, Id);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
