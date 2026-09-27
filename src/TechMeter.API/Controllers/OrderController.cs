using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Features.Order.Command.CancelOrder;
using TechMeter.Application.Features.Order.Command.CreateOrder;
using TechMeter.Application.Features.Order.Command.DeleteOrder;
using TechMeter.Application.Features.Order.Command.UpdateOrderStatus;
using TechMeter.Application.Features.Order.Query.GetAdminOrders;
using TechMeter.Application.Features.Order.Query.GetOrderById;
using TechMeter.Application.Features.Order.Query.GetProviderOrders;
using TechMeter.Application.Features.Order.Query.GetStudentOrders;
//using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Orders")]
    [Produces("application/json")]
    public class OrderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{OrderId}")]
        [SwaggerOperation(
            Summary = "Get order by ID",
            Description = "Returns the full details of a specific order. Students can only access their own orders; providers can view orders containing their courses.",
            OperationId = "Order_GetById",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Order retrieved successfully", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Order not found", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "Access denied to this order")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<OrderResponse>>> GetOrderByIdAsync([FromRoute] string OrderId)
        {
            var response = await _mediator.Send(new GetOrderByIdQuery() { userId = GetUserId(), orderId = OrderId });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("student")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Get student orders",
            Description = "Requires JWT Bearer authentication with the student role. Returns a paginated list of all orders placed by the authenticated student.",
            OperationId = "Order_GetStudentOrders",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Student orders retrieved successfully", typeof(Response<PaginatedList<OrderSummaryResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetStudentOrdersAsync([FromQuery] GetOrders getOrders)
        {
            var response = await _mediator.Send(new GetStudentOrdersQuery() { StudentId = GetUserId(), GetOrders = getOrders });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("provider")]
        [Authorize(Roles = "provider")]
        [SwaggerOperation(
            Summary = "Get provider orders",
            Description = "Requires JWT Bearer authentication with the provider role. Returns a paginated list of all orders that include courses created by the authenticated provider.",
            OperationId = "Order_GetProviderOrders",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Provider orders retrieved successfully", typeof(Response<PaginatedList<OrderSummaryResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetProviderOrdersAsync([FromQuery] GetOrders getOrders)
        {
            var response = await _mediator.Send(new GetProviderOrdersQuery() { ProviderId = GetUserId(), GetOrders = getOrders });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "admin")]
        [SwaggerOperation(
            Summary = "Get all orders (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Returns a paginated list of all orders on the platform.",
            OperationId = "Order_GetAdminOrders",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "All orders retrieved successfully", typeof(Response<PaginatedList<OrderSummaryResponse>>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetAdminOrdersAsync([FromQuery] GetOrders getOrders)
        {
            var response = await _mediator.Send(new GetAdminOrdersQuery() { GetOrders = getOrders });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("cancel/{orderId}")]
        [Authorize(Roles = "student")]
        [SwaggerOperation(
            Summary = "Cancel an order",
            Description = "Requires JWT Bearer authentication with the student role. Cancels the specified order if it is still in a cancellable state.",
            OperationId = "Order_CancelOrder",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Order cancelled successfully", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Order cannot be cancelled in its current state", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Order not found", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the student role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<OrderResponse>>> StudentCancelOrder([FromRoute] string orderId)
        {
            var response = await _mediator.Send(new CancelOrderCommand() { OrderId = orderId });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("status/{orderId}")]
        [Authorize(Roles = "admin,provider")]
        [Consumes("application/json")]
        [SwaggerOperation(
            Summary = "Update order status",
            Description = "Requires JWT Bearer authentication with the admin or provider role. Updates the status of the specified order (e.g. pending, completed, refunded).",
            OperationId = "Order_UpdateStatus",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Order status updated successfully", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid status transition or order not found", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin or provider role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<OrderResponse>>> updateOrderAsync([FromRoute] string orderId, [FromBody] UpdateOrderStatusRequest updateOrderStatus)
        {
            var response = await _mediator.Send(new UpdateOrderStatusCommand(orderId, updateOrderStatus.Status));
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{orderId}")]
        [Authorize(Roles = "admin")]
        [SwaggerOperation(
            Summary = "Delete an order (admin)",
            Description = "Requires JWT Bearer authentication with the admin role. Permanently deletes the specified order from the platform.",
            OperationId = "Order_Delete",
            Tags = new[] { "Orders" })]
        [SwaggerResponse(StatusCodes.Status200OK, "Order deleted successfully", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Order not found", typeof(Response<OrderResponse>))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "Missing or invalid JWT token")]
        [SwaggerResponse(StatusCodes.Status403Forbidden, "User does not have the admin role")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "Internal server error")]
        public async Task<ActionResult<Response<OrderResponse>>> DeleteOrderAsync([FromRoute] string orderId)
        {
            var response = await _mediator.Send(new DeleteOrderCommand() { OrderId = orderId });
            return StatusCode((int)response.StatusCode, response);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }
    }
}
