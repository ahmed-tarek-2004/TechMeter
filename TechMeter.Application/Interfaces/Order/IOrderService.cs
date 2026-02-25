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
        public Task<Response<OrderResponse>> CreateClientOrder(string ClientId);
        public Task<Response<OrderResponse>> GetOrderById(string UsserId, string OrderId);
        public Task<Response<PaginatedList<OrderSummaryResponse>>> GetClientOrders(string ClientId, GetOrders getOrders);
        public Task<Response<PaginatedList<OrderSummaryResponse>>> GetSellerOrders(string sellerId, GetOrders getOrders);
        public Task<Response<List<OrderResponse>>> GetSellOrdersDetails(string sellerId, string orderId);
        public Task<Response<PaginatedList<OrderSummaryResponse>>> GetAdminOrders(GetOrders getOrders);
        public Task<Response<OrderResponse>> UpdatOrderStatus(UpdateOrderStatus updateOrderStatus);
        public Task<Response<OrderResponse>> CancelOrderStatus(string orderId);
        public Task<Response<OrderResponse>> DeleteOrderByProviderOrAdmin(string OrderId);
    }
}
