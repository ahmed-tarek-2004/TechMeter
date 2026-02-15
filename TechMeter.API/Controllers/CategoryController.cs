using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TechMeter.Application.DTO.Category;
using TechMeter.Application.Interfaces.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<AddCategoryRequest> _createCategoryValidator;
        private readonly IValidator<UpdateCategoryRequest> _updateCategoryValidator;

        public CategoryController(ICategoryService categoryService, ResponseHandler responseHandler,
            IValidator<AddCategoryRequest> createCategoryValidator, IValidator<UpdateCategoryRequest> updateCategoryValidator)
        {
            _categoryService = categoryService;
            _responseHandler = responseHandler;
            _createCategoryValidator = createCategoryValidator;
            _updateCategoryValidator = updateCategoryValidator;
        }

        [HttpGet("getAll")]
        public async Task<ActionResult<Response<IEnumerable<GetCategoryDto>>>> GetAll()
        {
            var response = await _categoryService.GetCategoriesAsync();
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("get/{Id}")]
        public async Task<ActionResult<Response<GetCategoryDto>>> GetById(string Id)
        {
            var response = await _categoryService.GetCategoryByIdAsync(Id);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("update")]
        public async Task<ActionResult<Response<AddCategoryResponse>>> Create([FromBody] AddCategoryRequest request)
        {
            var validationResult = await _createCategoryValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                string errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<object>(errors).StatusCode,
                    _responseHandler.BadRequest<object>(errors));
            }
            var response = await _categoryService.AddCategoryAsync(request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("{Id}")]
        public async Task<ActionResult<Response<object>>> Update(string Id, [FromBody] UpdateCategoryRequest request)
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
            var response = await _categoryService.DeleteCategoryByIdAsync(Id);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
