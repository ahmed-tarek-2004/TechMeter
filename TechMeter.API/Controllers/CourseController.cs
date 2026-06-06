using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TechMeter.API.Hubs;
using TechMeter.API.Validators;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Course.Command.AddCourse;
using TechMeter.Application.Features.Course.Command.DeleteCourse;
using TechMeter.Application.Features.Course.Command.EditCourse;
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
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        public CourseController(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpGet("all")]
        public async Task<ActionResult<Response<List<GetCourseResponse>>>> GetAll()
        {
            var response = await _mediator.Send(new GetAllCoursesQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{Id}")]
        public async Task<ActionResult<Response<GetCourseResponse>>> GetCourseByIdAsync(string Id)
        {
            var response = await _mediator.Send(new GetCourseByIdQuery(Id));
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("provider")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<List<GetCourseResponse>>>> GetProviderCoursesAsync()
        {
            var response = await _mediator.Send(new GetProviderCoursesQuery(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<List<GetStudentCourseResponse>>>> GetStudentCoursesAsync()
        {
            var response = await _mediator.Send(new GetStudentCoursesQuery(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost]
        //[EnableRateLimiting(")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<AddCourseResponse>>> Create([FromForm] AddCourseRequest request)
        {
            var response = await _mediator.Send(new AddCourseCommand { providerId = GetUserId(), addCourseRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{courseId}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<string>>> Update([FromRoute] string courseId, [FromForm] EditCourseRequest request)
        {
            var response = await _mediator.Send(new EditCourseCommand { courseId = courseId, providerId = GetUserId(), editCourseRequest = request });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = "admin,provider")]
        public async Task<ActionResult<Response<string>>> Delete(string courseId)
        {
            var responsiableId = GetUserId();
            var response = await _mediator.Send(new DeleteCourseCommand(responsiableId!, courseId));
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
