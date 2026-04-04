using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.Category.Command.AddCategory;
using TechMeter.Application.Features.Category.Command.DeleteCategory;
using TechMeter.Application.Features.Category.Query.GetCategories;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly ICategoryService _categoryService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<UpdateCategoryRequest> _updateCategoryValidator;

        public CategoryController(ICategoryService categoryService, ResponseHandler responseHandler, IMapper mapper, IMediator mediator, IValidator<UpdateCategoryRequest> updateCategoryValidator)
        {
            _mediator = mediator;
            _mapper = mapper;
            _categoryService = categoryService;
            _responseHandler = responseHandler;
            _updateCategoryValidator = updateCategoryValidator;
        }

        [HttpGet("getAll")]
        public async Task<ActionResult<Response<List<GetCategoryDto>>>> GetAll()
        {
            var response = await _mediator.Send(new GetCategoriesQuery());
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("detail/by/{Id}")]
        public async Task<ActionResult<Response<GetCategoryDto>>> GetById(string Id)
        {
            var response = await _categoryService.GetCategoryByIdAsync(Id);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("create/category")]
        public async Task<ActionResult<Response<AddCategoryResponse>>> Create([FromBody] AddCategoryRequest request)
        {
            var command = _mapper.Map<AddCategoryCommand>(request);
            var response = await _categoryService.AddCategoryAsync(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{Id}")]
        public async Task<ActionResult<Response<object>>> Update([FromRoute] string Id, [FromBody] UpdateCategoryRequest request)
        {
            var validationResult = await _updateCategoryValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var response = await _categoryService.UpdateCategoryAsync(Id, request);
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
