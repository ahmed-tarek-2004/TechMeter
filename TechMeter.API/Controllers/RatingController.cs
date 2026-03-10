using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<AddStudentRatingRequest> _addStudentRatingRequestValidator;
        private readonly IValidator<EditStudentRatingRequest> _editStudentRatingRequestValidator;
        private readonly IValidator<DeleteAdminRatingRequest> _deleteAdminRatingRequestValidator;
        public RatingController(IRatingService ratingService, IValidator<AddStudentRatingRequest> addStudentRatingRequestValidator,
           IValidator<EditStudentRatingRequest> editStudentRatingRequestValidator, ResponseHandler responseHandler
            , IValidator<DeleteAdminRatingRequest> deleteAdminRatingRequestValidator)
        {
            _ratingService = ratingService;
            _responseHandler = responseHandler;
            _addStudentRatingRequestValidator = addStudentRatingRequestValidator;
            _editStudentRatingRequestValidator = editStudentRatingRequestValidator;
            _deleteAdminRatingRequestValidator = deleteAdminRatingRequestValidator;
        }

        [HttpPost("Student/add")]
        public async Task<ActionResult<Response<StudentCourseRatingDto>>> AddStudentRatingToCourse([FromBody] AddStudentRatingRequest request)
        {
            var validationResult = await _addStudentRatingRequestValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _ratingService.AddRatingToCourse(StudentId!, request);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("Student/edit")]
        public async Task<ActionResult<Response<StudentCourseRatingDto>>> EditStudentRating([FromBody] EditStudentRatingRequest request)
        {
            var validationResult = await _editStudentRatingRequestValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _ratingService.EditRatingToCourse(StudentId!, request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("Student/get/{CourseId}")]
        public async Task<ActionResult<Response<string>>> StudentGetCourseRating([FromRoute] string CourseId)
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _ratingService.GetStudentCourseRating(StudentId!, CourseId);
            return StatusCode((int)response.StatusCode, response);
        }


        //[Authorize(Roles ="Provider,admin")]
        [HttpGet("get-all/{CourseId}")]
        public async Task<ActionResult<Response<string>>> GetAllCourseRating([FromRoute] string CourseId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _ratingService.GetProdctRating(userId!, CourseId);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("Student/delete/{CourseId}")]
        public async Task<ActionResult<Response<string>>> StudentDeleteRating([FromRoute] string CourseId)
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _ratingService.DeleteStudentCourseionRating(StudentId!, CourseId);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("admin/delete")]
        public async Task<ActionResult<Response<string>>> AdminDeleteRating([FromBody] DeleteAdminRatingRequest request)
        {
            var validationResult = await _deleteAdminRatingRequestValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var response = await _ratingService.DeleteStudentCourseionRating(request.StudentId!, request.CourseId);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
