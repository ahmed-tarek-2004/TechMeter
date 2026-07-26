using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Order
{
    public interface IOrderService
    {
        public Task<Response<OrderResponse>> CreateStudentOrder(string StudentId, string? PaymentIntentId);
        public Task<Response<OrderResponse>> GetOrderByIdAsync(string UserId, string OrderId);
        public Task<Response<PaginatedList<OrderSummaryResponse>>> GetStudentOrders(string StudentId, GetOrders getOrders);
        public Task<Response<PaginatedList<OrderSummaryResponse>>> GetProviderOrders(string ProviderId, GetOrders getOrders);
        public Task<Response<List<OrderResponse>>> GetSellOrdersDetails(string ProviderId, string orderId);
        public Task<Response<PaginatedList<OrderSummaryResponse>>> GetAdminOrders(GetOrders getOrders);
        public Task<Response<OrderResponse>> UpdateOrderStatus(string orderId, string status);
        public Task<Response<OrderResponse>> CancelOrderStatus(string orderId);
        public Task<Response<OrderResponse>> DeleteOrderByProviderOrAdmin(string OrderId);
    }
}
