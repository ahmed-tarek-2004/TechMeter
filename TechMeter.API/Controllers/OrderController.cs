using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrderController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("{OrderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> GetOrderByIdAsync([FromRoute] string OrderId)
        {

            var response = await _mediator.Send(new GetOrderByIdQuery() { userId = GetUserId(), orderId = OrderId });
            return StatusCode((int)response.StatusCode, response);
        }

        //[HttpGet("provider/order-details/{OrderId}")]
        //public async Task<ActionResult<Response<List<OrderResponse>>>> GetproviderOrderDetailsAsync([FromRoute] string OrderId)
        //{
        //    var providerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    var response = await _orderService.GetSellOrderDetails(providerId!, OrderId);
        //    return StatusCode((int)response.StatusCode, response);
        //}

        [HttpGet("student/orders/{studentId}")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetStudentOrdersAsync([FromRoute] string studentId, [FromQuery] GetOrders getOrders)
        {
            var response = await _mediator.Send(new GetStudentOrdersQuery() { StudentId = studentId, GetOrders = getOrders });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("provider/orders/{providerId}")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetProviderOrdersAsync([FromRoute] string ProviderId, [FromQuery] GetOrders getOrders)
        {
            var response = await _mediator.Send(new GetProviderOrdersQuery() { ProviderId = ProviderId, GetOrders = getOrders });
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("admin")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetAdminOrdersAsync([FromQuery] GetOrders getOrders)
        {
            var response = await _mediator.Send(new GetAdminOrdersQuery() { GetOrders = getOrders });
            return StatusCode((int)response.StatusCode, response);
        }

        //[HttpPost]
        //public async Task<ActionResult<Response<OrderResponse>>> CreateOrderFromCart()
        //{
        //    var StudentId = GetUserId();
        //    var response = await _mediator.Send(new CreateOrderCommand() { StudentId = StudentId! });
        //    return StatusCode((int)response.StatusCode, response);
        //}

        [HttpPut("cancel/{orderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> StudentCancelOrder([FromRoute] string orderId)
        {

            var response = await _mediator.Send(new CancelOrderCommand() { OrderId = orderId });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("status/{orderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> updateOrderAsync([FromRoute] string orderId, [FromBody] UpdateOrderStatusRequest updateOrderStatus)
        {

            var response = await _mediator.Send(new UpdateOrderStatusCommand() { OrderId = orderId, Status = updateOrderStatus.Status });
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("{orderId}")]
       
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
