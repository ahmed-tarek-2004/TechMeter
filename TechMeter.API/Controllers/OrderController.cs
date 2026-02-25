using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<GetOrders> _getOrderValidation;
        private readonly IValidator<UpdateOrderStatus> _updateOrderStatus;
        public OrderController(IOrderService orderService, IValidator<UpdateOrderStatus> updateOrderStatus,
            IValidator<GetOrders> getOrderValidation, ResponseHandler responseHandler)
        {
            _orderService = orderService;
            _responseHandler = responseHandler;
            _getOrderValidation = getOrderValidation;
            _updateOrderStatus = updateOrderStatus;
        }
        [HttpGet("order/{OrderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> GetOrderByIdAsync([FromRoute] string OrderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _orderService.GetOrderById(userId!, OrderId);
            return StatusCode((int)response.StatusCode, response);
        }

        //[HttpGet("seller/order-details/{OrderId}")]
        //public async Task<ActionResult<Response<List<OrderResponse>>>> GetSellerOrderDetailsAsync([FromRoute] string OrderId)
        //{
        //    var sellerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    var response = await _orderService.GetSellOrderDetails(sellerId!, OrderId);
        //    return StatusCode((int)response.StatusCode, response);
        //}

        [HttpGet("client/orders/{ClientId}")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetClientOrdersAsync([FromRoute] string ClientId, [FromQuery] GetOrders getOrders)
        {

            var ValidationResult = await _getOrderValidation.ValidateAsync(getOrders);
            if (!ValidationResult.IsValid)
            {
                var Error = string.Join(", ", ValidationResult.Errors.Select(b => b.ErrorMessage));
                var badRequestResponse = _responseHandler.BadRequest<PaginatedList<OrderSummaryResponse>>(Error);
                return StatusCode((int)badRequestResponse.StatusCode, badRequestResponse);
            }

            var response = await _orderService.GetClientOrders(ClientId, getOrders);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("seller/orders/{sellerId}")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetSellerOrdersAsync([FromRoute] string sellerId, [FromQuery] GetOrders getOrders)
        {

            var ValidationResult = await _getOrderValidation.ValidateAsync(getOrders);
            if (!ValidationResult.IsValid)
            {
                var Error = string.Join(", ", ValidationResult.Errors.Select(b => b.ErrorMessage));
                var badRequestResponse = _responseHandler.BadRequest<PaginatedList<OrderSummaryResponse>>(Error);
                return StatusCode((int)badRequestResponse.StatusCode, badRequestResponse);
            }

            var response = await _orderService.GetSellerOrders(sellerId, getOrders);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("admin")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetAdminOrdersAsync([FromQuery] GetOrders getOrders)
        {
            var ValidationResult = await _getOrderValidation.ValidateAsync(getOrders);
            if (!ValidationResult.IsValid)
            {
                var Error = string.Join(", ", ValidationResult.Errors.Select(b => b.ErrorMessage));
                var badRequestResponse = _responseHandler.BadRequest<PaginatedList<OrderSummaryResponse>>(Error);
                return StatusCode((int)badRequestResponse.StatusCode, badRequestResponse);
            }

            var response = await _orderService.GetAdminOrders(getOrders);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("create")] 
        public async Task<ActionResult<Response<OrderResponse>>> CreateOrderFromCart([FromBody] CreateOrderRequest request)
        {


            var ClientId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _orderService.CreateClientOrder(ClientId!);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("cancel/{orderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> ClientCancelOrder([FromRoute] string orderId)
        {

            var response = await _orderService.CancelOrderStatus(orderId);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPut("update/status")]
        public async Task<ActionResult<Response<OrderResponse>>> updateOrderAsync([FromBody] UpdateOrderStatus updateOrderStatus)
        {
            var validation = await _updateOrderStatus.ValidateAsync(updateOrderStatus);
            if (!validation.IsValid)
            {
                var error = string.Join(", ", validation.Errors.Select(b => b.ErrorMessage));
                return StatusCode((int)_responseHandler.BadRequest<OrderResponse>(error).StatusCode,
                    _responseHandler.BadRequest<OrderResponse>(error));
            }
            var response = await _orderService.UpdatOrderStatus(updateOrderStatus);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpDelete("delete/{orderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> DeleteOrderAsync([FromRoute] string orderId)
        {
            var response = await _orderService.DeleteOrderByProviderOrAdmin(orderId);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
