using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ILogger<CartController> _logger;
        private readonly ICartService _cartService;
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<CartRequest> _cartRequestValidator;
        private readonly IValidator<UpdateCartItemRequest> _updateCartItemRequestValidator;
        public CartController(ILogger<CartController> logger, ApplicationDbContext context,
            ICartService cartService, ResponseHandler responseHandler,
            IValidator<CartRequest> cartRequestValidator,
            IValidator<UpdateCartItemRequest> updateCartItemRequestValidator)
        {
            _logger = logger;
            _context = context;
            _cartService = cartService;
            _responseHandler = responseHandler;
            _cartRequestValidator = cartRequestValidator;
            _updateCartItemRequestValidator = updateCartItemRequestValidator;
        }

        [Authorize(Roles = "student")]
        [HttpGet("get/Student/cart")]
        public async Task<ActionResult<Response<CartResponse>>> GetCartAsync()
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.GetCartAsync(StudentId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "provider")]
        [HttpGet("get/provider/cart/{StudentId}")]
        public async Task<ActionResult<Response<CartResponse>>> GetProviderCartAsync(string StudentId)
        {
            var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.GetProviderCartAsync(providerId ?? "", StudentId);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPost("student/add/to/cart")]
        public async Task<ActionResult<Response<CartResponse>>> AddToCartAsync([FromBody] CartRequest cartRequest)
        {
            var Validation = await _cartRequestValidator.ValidateAsync(cartRequest);
            if (!Validation.IsValid)
            {
                var error = string.Join(",", Validation.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<CartResponse>(error).StatusCode,
                    _responseHandler.BadRequest<CartResponse>(error));
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.AddToCartAsync(userId ?? "", cartRequest);
            return StatusCode((int)response.StatusCode, response);
        }
        //[Authorize(Roles = "student")]
        //[HttpPut("Student/update/cartItem")]
        //public async Task<ActionResult<Response<CartResponse>>> UpdateCartItemAsync([FromBody] UpdateCartItemRequest request)
        //{
        //    var Validation = await _updateCartItemRequestValidator.ValidateAsync(request);
        //    if (!Validation.IsValid)
        //    {
        //        var error = string.Join(",", Validation.Errors.Select(b => b.ErrorMessage));
        //        return StatusCode((int)_responseHandler.BadRequest<CartResponse>(error).StatusCode,
        //            _responseHandler.BadRequest<CartResponse>(error));
        //    }
        //    var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    var response = await _cartService.UpdateCartAsync(StudentId ?? "", request);
        //    return StatusCode((int)response.StatusCode, response);
        //}

        [Authorize(Roles = "student")]
        [HttpDelete("delete/Student/cart/{CartItemId}")]
        public async Task<ActionResult<Response<CartResponse>>> RemoveFromCartAsync([FromRoute] string CartItemId)
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.RemoveFromCartAsync(StudentId ?? "", CartItemId.ToString());
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpDelete("clear/Student/cart")]
        public async Task<ActionResult<Response<CartResponse>>> ClearStudentCartAsync()
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.ClearStudentCartAsync(StudentId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
