using Azure.Core;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.CodeAnalysis.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using Stripe.Forwarding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Payment.Command.Checkout;
using TechMeter.Application.Features.Payment.Command.PaymentIntent;
using TechMeter.Application.Interfaces.Services.Email;

//using TechMeter.Application.Interfaces.Payment;
using TechMeter.Application.Interfaces.Services.Order;
using TechMeter.Application.Interfaces.Services.Payment;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.EmailSender;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Shared;
using static System.Net.WebRequestMethods;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TechMeter.Infrastructure.Services.Payment
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<PaymentService> _logger;
        private readonly IOrderService _orderService;
        private readonly StripeSettings stripe;

        public PaymentService(ApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<PaymentService> logger, IOptions<StripeSettings> option, IOrderService orderService,
            IEmailService emailService)
        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
            stripe = option.Value;
            _orderService = orderService;
            _emailService = emailService;
        }
        public async Task<Response<PaymentResponse>> CreateACheckOut(CheckoutCommand command)
        {
            var user = await _context.Users.FindAsync(command.studentId);
            if (user == null)
            {
                return _responseHandler.BadRequest<PaymentResponse>("User is not found");
            }
            var cart = await _context.Cart.Include(b => b.CartItems).ThenInclude(b=>b.Course).FirstOrDefaultAsync(b => b.StudentId == command.studentId);

            if (cart == null || !cart.CartItems.Any() || cart.CartItems is null)
            {
                return _responseHandler.NotFound<PaymentResponse>("Cart is Empty.");
            }

            var lineItems = cart.CartItems
                         .Select(item => new SessionLineItemOptions
                         {
                             PriceData = new SessionLineItemPriceDataOptions
                             {
                                 Currency = command.currency,
                                 UnitAmountDecimal = item.UnitPrice * 100,
                                 ProductData = new SessionLineItemPriceDataProductDataOptions
                                 {
                                     Name = item.Course.Title,
                                     Description = item.Course.Description
                                 }
                             },
                             Quantity =1,
                         }).ToList();

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = "https://amars-marvelous-site-305200.webflow.io/",
                CancelUrl = "https://amars-fantabulous-site-16cb2e.webflow.io/",
                CustomerEmail = user.Email,
                Metadata = new Dictionary<string, string>
                {
                   { "cartId",cart.Id },
                   { "clientId", user.Id }
                },

            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            var response = new PaymentResponse()
            {
                SessionId = session.Id,
                SessionUrl = session.Url,
            };
            return _responseHandler.Success(response, "Continue to pay");
        }

        public async Task<Response<PaymentIntentResponse>> PaymentIntentService(PaymentIntentCommand request)
        {
            var user = await _context.Users.FindAsync(request.studentId);
            if (user == null)
            {
                return _responseHandler.BadRequest<PaymentIntentResponse>("User is not found");
            }
            var cart = await _context.Cart.Include(b => b.CartItems).FirstOrDefaultAsync(b => b.StudentId == request.studentId);

            if (cart == null || !cart.CartItems.Any() || cart.CartItems is null)
            {
                return _responseHandler.NotFound<PaymentIntentResponse>("Cart is Empty.");
            }

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(cart.CartItems.Sum(b => b.UnitPrice) * 100),
                Currency = request.currency ?? "usd",
                PaymentMethodTypes = new List<string> { "card" },
                //AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                //{
                //    Enabled = true
                //},
                Metadata = new Dictionary<string, string>
                {
                   { "cartId", cart.Id },
                   { "clientId", user.Id }
                }
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            var response = new PaymentIntentResponse()
            {
                ClientSecret = intent.ClientSecret,
                PaymentIntendId = intent.Id
            };
            return _responseHandler.Success(response, "ClientSecret Returned Successfully");
        }


        #region WeebHook
        public async Task<Response<object>> HandleWebHookAsync(string json, string stripeSignature)
        {
            _logger.LogInformation("Received webhook event. Signature: {Signature}", stripeSignature);

            try
            {
                Event stripeEvent;
                try
                {
                    stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, stripe.WebhookSecret);
                }
                catch (StripeException ex)
                {
                    _logger.LogError(ex, "Stripe Webhook validation failed");
                    return _responseHandler.BadRequest<object>(ex.Message);
                }

                _logger.LogInformation("Stripe Event received: {EventType}", stripeEvent.Type);

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null)
                        return _responseHandler.BadRequest<object>("Event data object is not a session.");

                    var cartId = session.Metadata.ContainsKey("cartId") ? session.Metadata["cartId"] : null;
                    if (cartId == null)
                        return _responseHandler.BadRequest<object>("Missing cartId in metadata.");

                    var cart = await _context.Order.FirstOrDefaultAsync(b => b.Id == cartId);
                    if (cart == null)
                        return _responseHandler.BadRequest<object>("Order not found.");

                    var userId = session.Metadata.ContainsKey("clientId") ? session.Metadata["clientId"] : null;
                    await AddingOrderToDatabaseAsync(userId!, null!);

                    _logger.LogInformation($" Checkout session completed for Order {cart.Id}");
                }
                else if (stripeEvent.Type == "payment_intent.amount_capturable_updated"
                    ||
                    stripeEvent.Type == "payment_intent.requires_capture"
                    //|| stripeEvent.Type == "requires_capture"
                    //|| stripeEvent.Type == "payment_intent.requires_action"
                    )
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent == null)
                        return _responseHandler.BadRequest<object>("Event data object is not a PaymentIntent.");

                    _logger.LogInformation($"PaymentIntent succeeded for: {paymentIntent.Id}");

                    var cartId = paymentIntent.Metadata.ContainsKey("cartId") ? paymentIntent.Metadata["cartId"] : null;
                    if (cartId == null)
                        return _responseHandler.BadRequest<object>("Missing cartId in metadata.");

                    var cart = await _context.Order.FirstOrDefaultAsync(b => b.Id == cartId);
                    if (cart == null)
                        return _responseHandler.BadRequest<object>("Order not found.");

                    var userId = paymentIntent.Metadata.ContainsKey("clientId") ? paymentIntent.Metadata["clientId"] : null;
                    await AddingOrderToDatabaseAsync(userId, paymentIntent.Id);

                }
                else if (stripeEvent.Type == "payment_intent.payment_failed")
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent != null)
                    {
                        _logger.LogWarning($"PaymentIntent failed for: {paymentIntent.Id}");

                        var cartId = paymentIntent.Metadata.ContainsKey("cartId") ? paymentIntent.Metadata["cartId"] : null;
                        if (cartId == null)
                            return _responseHandler.BadRequest<object>("Missing cartId in metadata.");

                        var order = await _context.Order.FirstOrDefaultAsync(b => b.Id == cartId);
                        if (order == null)
                            return _responseHandler.BadRequest<object>("Order not found.");

                        var userId = paymentIntent.Metadata.ContainsKey("clientId") ? paymentIntent.Metadata["clientId"] : null;
                        await AddingTransctionAndEditOrderStatusAsync(order, TransactionStatus.Canceled, OrderStatus.Canceled, userId);
                    }
                }
                else
                {
                    _logger.LogInformation($"Unhandled event type: {stripeEvent.Type}");
                }

                return _responseHandler.Success<object>("", "Webhook handled successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling webhook");
                return _responseHandler.InternalServerError<object>("Webhook handling failed.");
            }
        }
        #endregion
        public async Task<Response<PaginatedList<TransactionResponse>>> GetAllAdminTransaction(string? providerId, DateTime? from, DateTime? to, int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.PaymentTransactions
                .AsNoTracking()
                .AsQueryable();
            if (!string.IsNullOrEmpty(providerId))
            {
                var providerExists = await _context.Provider.AnyAsync(p => p.Id == providerId);

                if (!providerExists)
                    return _responseHandler.BadRequest<PaginatedList<TransactionResponse>>("Provider is not found");

                query = query.Where(b => b.ProviderId == providerId);
            }
            if (from.HasValue)
            {
                query = query.Where(b => b.Date >= from);
            }
            if (to.HasValue)
            {
                query = query.Where(b => b.Date <= to);
            }

            query = query.OrderByDescending(b => b.Date);

            var Transaction = query.Select(b => new TransactionResponse
            {
                Id = b.Id,
                Date = b.Date,
                OrderId = b.OrderId,
                ProviderId = b.ProviderId,
                Status = b.Status,
                StudentId = b.StudentId,
                TotalPrice = b.TotalPrice
            });
            var response = await PaginatedList<TransactionResponse>.CreatePaginatedList(Transaction, pageNumber, pageSize);
            return _responseHandler.Success(response, "Transaction Returned Successfully");
        }

        public async Task<Response<PaginatedList<TransactionResponse>>> GetAllProviderTransaction(string providerId, DateTime? from, DateTime? to, int pageNumber = 1, int pageSize = 10)
        {
            var provider = await _context.Provider.FindAsync(providerId);
            if (provider == null)
            {
                return _responseHandler.BadRequest<PaginatedList<TransactionResponse>>("Provider does not exists");
            }

            var query = _context.PaymentTransactions
               .AsNoTracking()
               .Where(b => b.ProviderId == providerId)
               .AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(b => b.Date >= from);
            }
            if (to.HasValue)
            {
                query = query.Where(b => b.Date <= to);
            }

            query = query.OrderByDescending(b => b.Date);

            var Transaction = query.Select(b => new TransactionResponse
            {
                Id = b.Id,
                Date = b.Date,
                OrderId = b.OrderId,
                ProviderId = b.ProviderId,
                Status = b.Status,
                StudentId = b.StudentId,
                TotalPrice = b.TotalPrice
            });
            var response = await PaginatedList<TransactionResponse>.CreatePaginatedList(Transaction, pageNumber, pageSize);
            return _responseHandler.Success(response, "Transaction Returned Successfully");
        }

        public async Task AddingTransctionAndEditOrderStatusAsync(Domain.Models.Order order, TransactionStatus transactionStatus, OrderStatus orderStatus, string userId)
        {

            var user = await _context.Users.FirstOrDefaultAsync(b => b.Id == userId);
            var providerId = await _context.OrderItem.Where(b => b.OrderId == order.Id).Select(b => b.Course.ProviderId).FirstOrDefaultAsync();
            var courses = await _context.OrderItem.Where(oi => oi.OrderId == order.Id).Select(oi => new GetCourseResponse
            {
                Id = oi.Course.Id,
                CategoryId = oi.Course.CategoryId,
                CourseProfileImageUrl = oi.Course.CourseProfileImageUrl,
                Currency = oi.Course.Currency,
                Description = oi.Course.Description,
                ProviderId = oi.Course.ProviderId,
                Price = oi.Course.Price,
                Title = oi.Course.Title
            }).AsNoTracking().ToListAsync();

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var studentCourses = new List<CourseStudent>();
                foreach (var course in courses)
                {
                    studentCourses.Add(new CourseStudent { CourseId = course.Id, StudentId = userId, EnrolmentDate = DateTime.UtcNow, LastAccess = DateTime.UtcNow });
                }
                var Transaction = new PaymentTransaction()
                {
                    Id = Guid.NewGuid().ToString(),
                    Date = DateTime.UtcNow,
                    OrderId = order.Id,
                    ProviderId = providerId!,
                    Status = transactionStatus,
                    StudentId = order.StudentId,
                    TotalPrice = order.TotalPrice,
                };
                await _context.PaymentTransactions.AddAsync(Transaction);
                await _context.CourseStudent.AddRangeAsync(studentCourses);
                order.Status = orderStatus;
                if (transactionStatus == TransactionStatus.Paid)
                    await _emailService.InvoiceEmailAsync(user!, Transaction, courses);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
            }
        }
        private async Task<bool> AddingOrderToDatabaseAsync(string clientId, string paymentIntentId)
        {


            var isExsist = await _context.Order.AnyAsync(o => o.PaymetnIntentId == paymentIntentId);

            if (!isExsist)
            {

                var orderResponse = await _orderService.CreateStudentOrder(clientId, paymentIntentId);
                if (!orderResponse.Succeeded)
                {
                    _logger.LogError("Failed to create order for client {ClientId}: {ErrorMessage}", clientId, orderResponse.Message);
                    _logger.LogError("Order creation failed for client {ClientId} with details: {Errors}", clientId, string.Join(", ", orderResponse.Errors));
                    return false;
                }
                _logger.LogInformation("Order created successfully for client {ClientId}: {OrderId}", clientId, orderResponse.Data.Id);
            }
            return true;
        }
    }
}
