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
using TechMeter.Application.Features.Rating.Query.GetProviderAllCourseRating;
using TechMeter.Application.Features.Rating.Query.GetStudentRating;
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
        public RatingController(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpPost("student")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<string>>> AddStudentRatingToCourse([FromBody] AddStudentRatingRequest request)
        {
            var response = await _mediator.Send(new AddStudentRatingCommand()
            {
                studentId = GetUserId(),
                addStudentRatingRequest = request
            });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("student")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<string>>> EditStudentRating([FromBody] EditStudentRatingRequest request)
        {
            var command = _mapper.Map<EditStudentRatingCommand>(request);
            command.StudentId = GetUserId();
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student/{CourseId}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<string>>> StudentGetCourseRating([FromRoute] string CourseId)
        {

            var query = new GetStudentCourseRatingQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, CourseId);
            var response = await _mediator.Send(query);
            return StatusCode((int)response.StatusCode, response);
        }


        [HttpGet("all/{CourseId}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> GetAllCourseRating([FromRoute] string CourseId)
        {
            var query = new GetProviderAllCourseRatingQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, CourseId);
            var response = await _mediator.Send(query);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("student/{CourseId}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<string>>> StudentDeleteRating([FromRoute] string CourseId)
        {

            var command = new DeleteStudentRatingCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, CourseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("admin/{studentId}/rating/rating-to-course/{courseId}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Response<string>>> AdminDeleteRating([FromRoute] string studentId, [FromRoute] string courseId)
        {
            var command = new DeleteStudentRatingCommand(studentId, courseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
