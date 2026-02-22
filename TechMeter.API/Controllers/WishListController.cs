using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishListController : ControllerBase
    {
        private readonly ILogger<WishListController> _logger;
        private readonly IWishListService _wishlistService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<AddToWishListRequest> _addToWishlistValidator;

        public WishListController(
            ILogger<WishListController> logger,
            IWishListService wishlistService,
            ResponseHandler responseHandler,
            IValidator<AddToWishListRequest> addToWishlistValidator)
        {
            _logger = logger;
            _wishlistService = wishlistService;
            _responseHandler = responseHandler;
            _addToWishlistValidator = addToWishlistValidator;
        }

        //[Authorize(Roles = "student")]
        [HttpGet("get/student/wishlist")]
        public async Task<ActionResult<Response<GetWishListResponse>>> GetWishlistAsync()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _wishlistService.GetWishlistAsync(studentId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpPost("student/add/to/wishlist")]
        public async Task<ActionResult<Response<GetWishListResponse>>> AddToWishlistAsync([FromBody] AddToWishListRequest request)
        {
            var validation = await _addToWishlistValidator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                var error = string.Join(",", validation.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<GetWishListResponse>(error).StatusCode,
                    _responseHandler.BadRequest<GetWishListResponse>(error));
            }

            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _wishlistService.AddToWishlistAsync(studentId!, request);
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpDelete("student/remove/item/{wishlistItemId}")]
        public async Task<ActionResult<Response<GetWishListResponse>>> RemoveFromWishlistAsync([FromRoute] string wishlistItemId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _wishlistService.RemoveFromWishlistAsync(studentId ?? "", wishlistItemId);
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpDelete("student/clear/wishlist")]
        public async Task<ActionResult<Response<object>>> ClearWishlistAsync()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _wishlistService.ClearWishlistAsync(studentId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
