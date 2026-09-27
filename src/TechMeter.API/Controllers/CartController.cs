using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.Cart.Command.ClearStudentCart;
using TechMeter.Application.Features.Cart.Command.RemoveCartItem;
using TechMeter.Application.Features.Cart.Query.GetProviderStudentCart;
using TechMeter.Application.Features.Cart.Query.GetStudentCart;
//using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Cart")]
    [Produces("application/json")]
    public class CartController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CartController> _logger;
        public CartController(IMediator mediator, ILogger<CartController> logger)
        {
            _logger = logger;
            _mediator = mediator;
        }

        [Authorize(Roles = "student")]
        [HttpGet("student")]
        [SwaggerOperation(
            Summary = "Get student cart",
            Description = "Requires JWT Bearer authentication with the student role. Returns the current authenticated student's cart with all items.",
            OperationId = "Cart_GetStudentCart",
            Tags = new[] { "Cart" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Cart retrieved successfully", typeof(Response<CartResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<CartResponse>>> GetCartAsync()
        {
            var command = new GetStudentCartQuery(GetUserId());
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPost("student")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Add course to cart",
            Description = "Requires JWT Bearer authentication with the student role. Adds the specified course to the authenticated student's cart.",
            OperationId = "Cart_AddToCart",
            Tags = new[] { "Cart" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Course added to cart successfully", typeof(Response<CartResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Course already in cart or invalid course ID", typeof(Response<CartResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<CartResponse>>> AddToCartAsync([FromBody] CartRequest cartRequest)
        {
            var response = await _mediator.Send(new AddToCartCommand { StudentId = GetUserId(), CourseId = cartRequest.CourseId });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("student/{cartItemId}")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Remove item from cart",
            Description = "Requires JWT Bearer authentication with the student role. Removes the specified cart item from the authenticated student's cart.",
            OperationId = "Cart_RemoveFromCart",
            Tags = new[] { "Cart" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Item removed from cart successfully", typeof(Response<CartResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Cart item not found", typeof(Response<CartResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<CartResponse>>> RemoveFromCartAsync([FromRoute] string cartItemId)
        {
            var command = new RemoveCartItemCommand(GetUserId(), cartItemId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("clear")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Clear student cart",
            Description = "Requires JWT Bearer authentication with the student role. Removes all items from the authenticated student's cart.",
            OperationId = "Cart_ClearCart",
            Tags = new[] { "Cart" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Cart cleared successfully", typeof(Response<CartResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<CartResponse>>> ClearStudentCartAsync()
        {
            var response = await _mediator.Send(new ClearStudentCartCommand(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
