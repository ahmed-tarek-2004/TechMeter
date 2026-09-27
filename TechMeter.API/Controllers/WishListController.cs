using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
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
    [Tags("Wishlist")]
    [Produces("application/json")]
    public class WishListController(IMediator mediator) : ControllerBase
    {

        [Authorize(Roles = "student")]
        [HttpGet("")]
        [SwaggerOperation(
            Summary = "Get student wishlist",
            Description = "Requires JWT Bearer authentication with the student role. Returns the authenticated student's wishlist with all saved courses.",
            OperationId = "WishList_GetWishlist",
            Tags = new[] { "Wishlist" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Wishlist retrieved successfully", typeof(Response<GetWishListResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetWishListResponse>>> GetWishlistAsync()
        {
            var response = await mediator.Send(new GetWishListByIdQuery(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPost("{courseId}")]
        [SwaggerOperation(
            Summary = "Add course to wishlist",
            Description = "Requires JWT Bearer authentication with the student role. Adds the specified course to the authenticated student's wishlist.",
            OperationId = "WishList_AddToWishlist",
            Tags = new[] { "Wishlist" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course added to wishlist successfully", typeof(Response<GetWishListResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Course already in wishlist or course not found", typeof(Response<GetWishListResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetWishListResponse>>> AddToWishlistAsync(string courseId)
        {
            var command = new AddToWishListCommand(GetUserId(), courseId);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpDelete("{wishlistItemId}")]
        [SwaggerOperation(
            Summary = "Remove item from wishlist",
            Description = "Requires JWT Bearer authentication with the student role. Removes the specified item from the authenticated student's wishlist.",
            OperationId = "WishList_RemoveItem",
            Tags = new[] { "Wishlist" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Item removed from wishlist successfully", typeof(Response<GetWishListResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Wishlist item not found", typeof(Response<GetWishListResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<GetWishListResponse>>> RemoveFromWishlistAsync([FromRoute] string wishlistItemId)
        {
            var command = new RemoveFromWishlistCommand(GetUserId(), wishlistItemId);
            var response = await mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpDelete("clear")]
        [SwaggerOperation(
            Summary = "Clear wishlist",
            Description = "Requires JWT Bearer authentication with the student role. Removes all items from the authenticated student's wishlist.",
            OperationId = "WishList_Clear",
            Tags = new[] { "Wishlist" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Wishlist cleared successfully", typeof(Response<object>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
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
