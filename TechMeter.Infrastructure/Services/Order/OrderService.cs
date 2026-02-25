using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Interfaces.Order;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Order
{
    public class OrderService:IOrderService
    {
        private readonly ILogger<OrderService> _logger;
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        public OrderService(ILogger<OrderService> logger, ApplicationDbContext context, ResponseHandler responseHandler)
        {
            _logger = logger;
            _context = context;
            _responseHandler = responseHandler;
        }


        #region CreateStudentOrder
        public async Task<Response<OrderResponse>> CreateStudentOrder(string StudentId)
        {
            var Student = await _context.Student.FirstOrDefaultAsync(b => b.Id == StudentId);
            if (Student == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<OrderResponse>("User Not Found , Login/Register To Continue");
            }
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.Cart.Include(c => c.CartItems).ThenInclude(b => b.Course).FirstOrDefaultAsync(b => b.StudentId == Student.Id);
                if (cart == null || !cart.CartItems.Any() || cart.CartItems == null)
                {
                    _logger.LogWarning("There is no Courses in Your Cart");
                    return _responseHandler.BadRequest<OrderResponse>("Cart Is Empty");
                }

                var order = new TechMeter.Domain.Models.Order()
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = StudentId,
                    CreatedAt = DateTime.UtcNow,
                    Status = TechMeter.Domain.Enums.OrderStatus.PendingPayment,
                    TotalPrice = cart.CartItems.Sum(b => b.UnitPrice),
                    UpdatedAt = DateTime.UtcNow,
                    OrderItems = new List<OrderItem>()
                };
                foreach (var item in cart.CartItems)
                {
                    var Course = item.Course;

                    var orderItem = new OrderItem()
                    {
                        Id = Guid.NewGuid().ToString(),
                        OrderId = order.Id,
                        CourseId = item.CourseId,
                        Course = item.Course,
                    };
                    order.OrderItems.Add(orderItem);
                }
                await _context.Order.AddAsync(order);
                _context.CartItem.RemoveRange(cart.CartItems);
                cart.UpdatedAt = DateTime.UtcNow;
                _context.Cart.Update(cart);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                var response = new OrderResponse()
                {
                    Id = order.Id,
                    StudentId = StudentId,
                    CreatedAt = order.CreatedAt,
                    TotalPrice = order.TotalPrice,
                    Status = order.Status,
                    OrderItems = order.OrderItems.Select(b => new OrderItemResponse()
                    {
                        Id = b.Id,
                        CourseId = b.CourseId,
                        CourseName = b.Course.Title,

                    }).ToList()
                };
                return _responseHandler.Success(response, "Order Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<OrderResponse>("Internal Server Error");
            }
        }
        #endregion



        #region DeleteOrder
        public async Task<Response<OrderResponse>> DeleteOrderByProviderOrAdmin(string OrderId)
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var order = await _context.Order
                    .FirstOrDefaultAsync(b => b.Id == OrderId);

                if (order == null)
                {
                    _logger.LogWarning("There is no Courses in Your Order");
                    return _responseHandler.BadRequest<OrderResponse>("Order Is Empty");
                }

                _context.Remove(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = await BuildOrderResponseAsync(OrderId);
                return _responseHandler.Success(response, "Order Deleted Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.BadRequest<OrderResponse>("Internal Serevr Error Check Log files"); ;
            }
        }
        #endregion


        #region GetOrderById
        public async Task<Response<OrderResponse>> GetOrderById(string UserId, string OrderId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(b => b.Id == UserId);
            if (user == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<OrderResponse>("User Not Found , Login/Register To Continue");
            }
            var transaction = await _context.Database.BeginTransactionAsync();

            var order = await _context.Order
                .Include(c => c.OrderItems)
                .ThenInclude(b => b.Course)
                .FirstOrDefaultAsync(b => b.Id == OrderId);


            if (order == null || !order.OrderItems.Any() || order.OrderItems == null)
            {
                _logger.LogWarning("There is no Courses in Your Order");
                return _responseHandler.BadRequest<OrderResponse>("Order Is Empty");
            }

            var response = new OrderResponse()
            {
                Id = order.Id,
                StudentId = UserId,
                CreatedAt = order.CreatedAt,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                OrderItems = order.OrderItems.Select(b => new OrderItemResponse()
                {
                    Id = b.Id,
                    CourseId = b.CourseId,
                    CourseName = b.Course.Title,

                }).ToList()
            };
            return _responseHandler.Success(response, "Order returned Successfully");


        }

        #endregion


        #region GetStudentOrders
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> GetStudentOrders(string StudentId, GetOrders getOrders)
        {
            var Student = await _context.Student.FirstOrDefaultAsync(b => b.Id == StudentId);
            if (Student == null)
            {
                _logger.LogWarning("User is not found ");
                return _responseHandler.NotFound<PaginatedList<OrderSummaryResponse>>("User Not Found , Login/Register To Continue");
            }
            var name = _context.Users.Where(b => b.Id == StudentId).Select(b => b.UserName).ToString();

            var orders = _context.Order
                   .Where(o => o.StudentId == Student.Id)
                   .Select(o => new OrderSummaryResponse
                   {
                       Id = o.Id,
                       StudentId = StudentId,
                       CreatedAt = o.CreatedAt,
                       Status = o.Status,
                       StudentName = name,
                       Total = o.TotalPrice
                   });

            var paginaredList = await PaginatedList<OrderSummaryResponse>.CreatePaginatedList(orders, getOrders.PageSize, getOrders.PageNumber);


            return _responseHandler.Success(paginaredList, "Order returned Successfully");
        }
        #endregion


        #region UpdateOrderStatus
        public async Task<Response<OrderResponse>> UpdatOrderStatus(UpdateOrderStatus updateOrderStatus)
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (!Enum.TryParse<OrderStatus>(updateOrderStatus.Status, true, out OrderStatus orderStatus))
                {
                    return _responseHandler.BadRequest<OrderResponse>("New Status is not defined");
                }

                var order = await _context.Order.FirstOrDefaultAsync(b => b.Id == updateOrderStatus.OrderId);
                if (order == null)
                {
                    return _responseHandler.NotFound<OrderResponse>("order is not found");
                }

                order.Status = orderStatus;
                order.UpdatedAt = DateTime.Now;
                _context.Update(order);
                await transaction.CommitAsync();
                await _context.SaveChangesAsync();

                var response = await BuildOrderResponseAsync(order.Id);
                return _responseHandler.Success(response, "Status Updated Successfully");
            }
            catch (Exception ex)
            {
                await transaction.CommitAsync();
                return _responseHandler.InternalServerError<OrderResponse>("Internal Server Error check Log Files");
            }

        }
        #endregion


        #region CancelOrder
        public async Task<Response<OrderResponse>> CancelOrderStatus(string orderId)
        {

            try
            {
                var order = await _context.Order.FirstOrDefaultAsync(b => b.Id == orderId);
                if (order == null)
                {
                    return _responseHandler.NotFound<OrderResponse>("Order is Not Found");
                }
                if (order.Status == OrderStatus.Canceled)
                {
                    return _responseHandler.BadRequest<OrderResponse>("order is already canceled"); ;
                }
                order.Status = OrderStatus.Canceled;
                //_context.Update(order);
                await _context.SaveChangesAsync();
                var response = await BuildOrderResponseAsync(orderId);
                return _responseHandler.Success(response, "order cancled Successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId}", orderId);
                return _responseHandler.InternalServerError<OrderResponse>("Server Error , Check Log Files ");
            }
        }
        #endregion


        #region GetProviderOrders
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> GetProviderOrders(string ProviderId, GetOrders getOrders)
        {

            var Provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == ProviderId);//check is verifed too in future
            if (Provider == null)
            {
                return _responseHandler.NotFound<PaginatedList<OrderSummaryResponse>>("Provider is not Authorized");
            }


            var orders = _context.Order.Where(o => o.OrderItems.Any(oi => oi.Course.ProviderId == ProviderId)).Select(o => new OrderSummaryResponse()
            {
                Id = o.Id,
                StudentId = o.StudentId,
                CreatedAt = o.CreatedAt,
                //StudentName = o.Student.,
                Status = o.Status,
                Total = o.TotalPrice,
            });


            var response = await PaginatedList<OrderSummaryResponse>.CreatePaginatedList(orders, getOrders.PageSize, getOrders.PageNumber);
            return _responseHandler.Success(response, "Order Returned Successfully for Admin");


        }
        #endregion


        #region GetAdminOrders
        public async Task<Response<PaginatedList<OrderSummaryResponse>>> GetAdminOrders(GetOrders getOrders)
        {
            var orders = _context.Order.Select(o => new OrderSummaryResponse()
            {
                Id = o.Id,
                StudentId = o.StudentId,
                CreatedAt = o.CreatedAt,
                //StudentName = o.Student.FullName,
                Status = o.Status,
                Total = o.TotalPrice
            });
            var response = await PaginatedList<OrderSummaryResponse>.CreatePaginatedList(orders, getOrders.PageSize, getOrders.PageNumber);
            return _responseHandler.Success(response, "Order Returned Successfully for Admin");
        }
        #endregion


        #region GetSellOrdersDetails
        public async Task<Response<List<OrderResponse>>> GetSellOrdersDetails(string ProviderId, string orderId)
        {
            var Provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == ProviderId);//check is verifed too in future
            if (Provider == null)
            {
                return _responseHandler.NotFound<List<OrderResponse>>("Provider is not Authorized");
            }

            var orderResponse = await _context.Order.Where(o => o.Id == orderId).Select(o => new OrderResponse()
            {
                Id = o.Id,
                StudentId = o.StudentId,
                CreatedAt = o.CreatedAt,
                Status = o.Status,
                TotalPrice = o.TotalPrice,
                OrderItems = o.OrderItems.Where(o => o.Course.ProviderId == ProviderId).Select(oi => new OrderItemResponse
                {
                    Id = oi.Id,
                    CourseId = oi.CourseId,
                    CourseName = oi.Course.Title,
                }).ToList()

            }).ToListAsync();

            return _responseHandler.Success(orderResponse, $"Order Details for {Provider} returened Successfully");
        }
        #endregion

        #region BuidOrderResponse 
        private async Task<OrderResponse> BuildOrderResponseAsync(string orderId)
        {
            var orderResponse = await _context.Order.Select(order => new OrderResponse
            {
                Id = order.Id,
                StudentId = order.StudentId,
                CreatedAt = order.CreatedAt,
                Status = order.Status,
                TotalPrice = order.TotalPrice,
                OrderItems = order.OrderItems.Select(oi => new OrderItemResponse
                {
                    Id = oi.Id,
                    CourseId = oi.CourseId,
                    CourseName = oi.Course.Title,
                }).ToList()
            }).FirstOrDefaultAsync(o => o.Id == orderId);

            return orderResponse;
        }

        #endregion
    }
}
