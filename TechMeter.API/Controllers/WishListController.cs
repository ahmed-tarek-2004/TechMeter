using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Features.WishList.Command.AddToWishList;
using TechMeter.Application.Features.WishList.Command.ClearWishlistItem;
using TechMeter.Application.Features.WishList.Command.RemoveFromWishlistItem;
using TechMeter.Application.Features.WishList.Queries.GetWishListById;
//using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishListController : ControllerBase
    {
        private readonly ILogger<WishListController> _logger;
        //private readonly IWishListService _wishlistService;
        private readonly ResponseHandler _responseHandler;
        //private readonly IValidator<AddToWishListRequest> _addToWishlistValidator;
        private readonly IMediator _mediator;

        public WishListController(
            ILogger<WishListController> logger,
            //IWishListService wishlistService,
            ResponseHandler responseHandler,
            IMediator mediator)
        {
            _logger = logger;
            //_wishlistService = wishlistService;
            _responseHandler = responseHandler;
            _mediator = mediator;
        }

        //[Authorize(Roles = "student")]
        [HttpGet("get/student/wishlist")]
        public async Task<ActionResult<Response<GetWishListResponse>>> GetWishlistAsync()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(new GetWishListByIdQuery(studentId!));
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpPost("student/add/course/{courseId}/to/wishlist")]
        public async Task<ActionResult<Response<GetWishListResponse>>> AddToWishlistAsync(string courseId)
        {

            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new AddToWishListCommand(studentId!, courseId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpDelete("student/remove/item/{wishlistItemId}")]
        public async Task<ActionResult<Response<GetWishListResponse>>> RemoveFromWishlistAsync([FromRoute] string wishlistItemId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new RemoveFromWishlistCommand(studentId!, wishlistItemId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpDelete("student/clear/wishlist")]
        public async Task<ActionResult<Response<object>>> ClearWishlistAsync()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new ClearWishlistItemCommand(studentId!);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
