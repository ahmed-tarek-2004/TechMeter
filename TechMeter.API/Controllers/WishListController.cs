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
    public class WishListController(IMediator mediator) : ControllerBase
    {
       
        //[Authorize(Roles = "student")]
        [HttpGet("get/student/wishlist")]
        public async Task<ActionResult<Response<GetWishListResponse>>> GetWishlistAsync()
        {
            var response = await mediator.Send(new GetWishListByIdQuery(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpPost("student/add/course/{courseId}/to/wishlist")]
        public async Task<ActionResult<Response<GetWishListResponse>>> AddToWishlistAsync(string courseId)
        {

            var command = new AddToWishListCommand(GetUserId(), courseId);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpDelete("student/remove/item/{wishlistItemId}")]
        public async Task<ActionResult<Response<GetWishListResponse>>> RemoveFromWishlistAsync([FromRoute] string wishlistItemId)
        {
            var command = new RemoveFromWishlistCommand(GetUserId(), wishlistItemId);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        //[Authorize(Roles = "student")]
        [HttpDelete("student/clear/wishlist")]
        public async Task<ActionResult<Response<object>>> ClearWishlistAsync()
        {
            var command = new ClearWishlistItemCommand(GetUserId());
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
