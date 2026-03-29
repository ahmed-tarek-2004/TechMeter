using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Command.AddStudentRating;
using TechMeter.Application.Features.Rating.Command.DeleteStudentRating;
using TechMeter.Application.Features.Rating.Command.EditStudentRating;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly IRatingService _ratingService;
        private readonly ResponseHandler _responseHandler;
        public RatingController(IMediator mediator, IMapper mapper,
            IRatingService ratingService, ResponseHandler responseHandler)
        {
            _mediator = mediator;
            _mapper = mapper;
            _ratingService = ratingService;
            _responseHandler = responseHandler;
        }

        [HttpPost("student/add")]
        public async Task<ActionResult<Response<StudentCourseRatingDto>>> AddStudentRatingToCourse([FromBody] AddStudentRatingRequest request)
        {

            var command = _mapper.Map<AddStudentRatingCommand>(request);
            command.StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("student/edit")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<StudentCourseRatingDto>>> EditStudentRating([FromBody] EditStudentRatingRequest request)
        {
            var command = _mapper.Map<EditStudentRatingCommand>(request);
            command.StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/get/{CourseId}")]
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

        [HttpDelete("student/delete/{CourseId}")]
        public async Task<ActionResult<Response<string>>> StudentDeleteRating([FromRoute] string CourseId)
        {

            var command = new DeleteStudentRatingCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, CourseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("admin/delete/student/{studentId}/rating-to-course/{courseId}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Response<string>>> AdminDeleteRating([FromRoute] string studentId, [FromRoute] string courseId)
        {
            var command = new DeleteStudentRatingCommand(studentId, courseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
