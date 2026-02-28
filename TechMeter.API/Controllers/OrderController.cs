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

            var ValidationResult = await _getOrderValidation.ValidateAsync(getOrders);
            if (!ValidationResult.IsValid)
            {
                var Error = string.Join(", ", ValidationResult.Errors.Select(b => b.ErrorMessage));
                var badRequestResponse = _responseHandler.BadRequest<PaginatedList<OrderSummaryResponse>>(Error);
                return StatusCode((int)badRequestResponse.StatusCode, badRequestResponse);
            }

            var response = await _orderService.GetStudentOrders(studentId, getOrders);
            return StatusCode((int)response.StatusCode, response);
        }
        [HttpGet("provider/orders/{providerId}")]
        public async Task<ActionResult<Response<PaginatedList<OrderSummaryResponse>>>> GetProviderOrdersAsync([FromRoute] string ProviderId, [FromQuery] GetOrders getOrders)
        {

            var ValidationResult = await _getOrderValidation.ValidateAsync(getOrders);
            if (!ValidationResult.IsValid)
            {
                var Error = string.Join(", ", ValidationResult.Errors.Select(b => b.ErrorMessage));
                var badRequestResponse = _responseHandler.BadRequest<PaginatedList<OrderSummaryResponse>>(Error);
                return StatusCode((int)badRequestResponse.StatusCode, badRequestResponse);
            }

            var response = await _orderService.GetProviderOrders(ProviderId, getOrders);
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
           // var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _orderService.CreateStudentOrder(request.StuentId);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("cancel/{orderId}")]
        public async Task<ActionResult<Response<OrderResponse>>> StudentCancelOrder([FromRoute] string orderId)
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
