using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.Category.Command.AddCategory;
using TechMeter.Application.Features.Category.Command.DeleteCategory;
using TechMeter.Application.Features.Category.Command.UpdateCategory;
using TechMeter.Application.Features.Category.Query.GetCategories;
using TechMeter.Application.Features.Category.Query.GetCategoryById;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<Response<List<GetCategoryDto>>>> GetAll()
        {
            var response = await _mediator.Send(new GetCategoriesQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("detail/{Id}")]
        public async Task<ActionResult<Response<GetCategoryDto>>> GetById(string Id)
        {
            var command = new GetCategoryByIdQuery(Id);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("category")]
        public async Task<ActionResult<Response<AddCategoryResponse>>> Create([FromBody] AddCategoryRequest request)
        {
            var response = await _mediator.Send(new AddCategoryCommand(request.Name, request.Description));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{Id}")]
        public async Task<ActionResult<Response<object>>> Update([FromRoute] string Id, [FromBody] UpdateCategoryRequest request)
        {
            var response = await _mediator.Send(new UpdateCategoryCommand(Id, request.Name, request.Description));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult<Response<string>>> Delete(string Id)
        {
            var response = await _mediator.Send(new DeleteCategoryCommand(Id));
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
