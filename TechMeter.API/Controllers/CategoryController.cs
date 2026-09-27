using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.Category.Command.AddCategory;
using TechMeter.Application.Features.Category.Command.DeleteCategory;
using TechMeter.Application.Features.Category.Command.UpdateCategory;
using TechMeter.Application.Features.Category.Query.GetCategories;
using TechMeter.Application.Features.Category.Query.GetCategoryById;
//using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Categories")]
    [Produces("application/json")]
    public class CategoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Get all categories",
            Description = "Returns a list of all available course categories.",
            OperationId = "Category_GetAll",
            Tags = new[] { "Categories" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Categories retrieved successfully", typeof(Response<List<GetCategoryDto>>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<List<GetCategoryDto>>>> GetAll()
        {
            var response = await _mediator.Send(new GetCategoriesQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("detail/{Id}")]
        [SwaggerOperation(
            Summary = "Get category by ID",
            Description = "Returns the details of a single category identified by its unique ID.",
            OperationId = "Category_GetById",
            Tags = new[] { "Categories" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Category retrieved successfully", typeof(Response<GetCategoryDto>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Category not found", typeof(Response<GetCategoryDto>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetCategoryDto>>> GetById(string Id)
        {
            var command = new GetCategoryByIdQuery(Id);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("category")]
        [Authorize(Roles = "admin")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Create a new category",
            Description = "Requires JWT Bearer authentication with the admin role. Creates a new course category with the provided name and description.",
            OperationId = "Category_Create",
            Tags = new[] { "Categories" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Category created successfully", typeof(Response<AddCategoryResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure or category already exists", typeof(Response<AddCategoryResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<AddCategoryResponse>>> Create([FromBody] AddCategoryRequest request)
        {
            var response = await _mediator.Send(new AddCategoryCommand(request.Name, request.Description));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{Id}")]
        [Authorize(Roles = "admin")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Update a category",
            Description = "Requires JWT Bearer authentication with the admin role. Updates the name and description of an existing category.",
            OperationId = "Category_Update",
            Tags = new[] { "Categories" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Category updated successfully", typeof(Response<object>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Validation failure", typeof(Response<object>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Category not found", typeof(Response<object>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<object>>> Update([FromRoute] string Id, [FromBody] UpdateCategoryRequest request)
        {
            var response = await _mediator.Send(new UpdateCategoryCommand(Id, request.Name, request.Description));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{Id}")]
        [Authorize(Roles = "admin")]
        [SwaggerOperation(
            Summary = "Delete a category",
            Description = "Requires JWT Bearer authentication with the admin role. Permanently deletes the specified category.",
            OperationId = "Category_Delete",
            Tags = new[] { "Categories" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Category deleted successfully", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Category not found", typeof(Response<string>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<string>>> Delete(string Id)
        {
            var response = await _mediator.Send(new DeleteCategoryCommand(Id));
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
