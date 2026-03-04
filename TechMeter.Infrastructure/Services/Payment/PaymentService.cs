using Azure.Core;
using Microsoft.CodeAnalysis.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Interfaces.Payment;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Adapters.Payment;
using TechMeter.Infrastructure.Persistence;
using static System.Net.WebRequestMethods;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TechMeter.Infrastructure.Services.Payment
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<PaymentService> _logger;
        private readonly StripeSettings stripe;

        public PaymentService(ApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<PaymentService> logger, IOptions<StripeSettings> option)
        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
            stripe = option.Value;
        }
        public async Task<Response<PaymentResponse>> CreateACheckOut(string studentId, PaymentRequest request)
        {
            var user = await _context.Users.FindAsync(studentId);
            if (user == null)
            {
                return _responseHandler.BadRequest<PaymentResponse>("User is not found");
            }
            var order = await _context.Order
                .AsNoTracking()
                .Include(b => b.OrderItems)
                .ThenInclude(b => b.Course)
                .FirstOrDefaultAsync(b => b.Id == request.OrderId);
            if (order == null)
            {
                return _responseHandler.NotFound<PaymentResponse>("User is not found");
            }
            var lineItems = order.OrderItems
                         .Select(item => new SessionLineItemOptions
                         {
                             PriceData = new SessionLineItemPriceDataOptions
                             {
                                 Currency = request.Currency,
                                 UnitAmountDecimal = item.UnitPrice * 100,
                                 ProductData = new SessionLineItemPriceDataProductDataOptions
                                 {
                                     Name = item.Course.Title,
                                     Description = item.Course.Description
                                 }
                             },
                             Quantity = 1
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
                   { "orderId", request.OrderId },
                   { "clientId", user.Id }
                }
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

        public async Task<Response<PaymentIntentResponse>> PaymentIntentService(string StudentId, PaymentRequest request)
        {
            var user = await _context.Users.FindAsync(StudentId);
            if (user == null)
            {
                return _responseHandler.BadRequest<PaymentIntentResponse>("User is not found");
            }
            var order = await _context.Order
                .AsNoTracking()
                .Include(b => b.OrderItems)
                .ThenInclude(b => b.Course)
                .FirstOrDefaultAsync(b => b.Id == request.OrderId && b.StudentId == StudentId && b.Status == OrderStatus.PendingPayment);
            if (order == null)
            {
                return _responseHandler.NotFound<PaymentIntentResponse>("Order is not found");
            }
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(order.OrderItems.Sum(b => b.UnitPrice) * 100),
                Currency = request.Currency ?? "usd",
                PaymentMethodTypes = new List<string> { "card" },
                //AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                //{
                //    Enabled = true
                //},
                Metadata = new Dictionary<string, string>
                {
                   { "orderId", request.OrderId },
                   { "clientId", user.Id }
                }
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            var response = new PaymentIntentResponse()
            {
                ClientSecret = intent.ClientSecret,
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

                    var orderId = session.Metadata.ContainsKey("orderId") ? session.Metadata["orderId"] : null;
                    if (orderId == null)
                        return _responseHandler.BadRequest<object>("Missing orderId in metadata.");

                    var order = await _context.Order.FirstOrDefaultAsync(b => b.Id == orderId);
                    if (order == null)
                        return _responseHandler.BadRequest<object>("Order not found.");

                    order.Status = OrderStatus.Paid;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($" Checkout session completed for Order {order.Id}");
                }
                else if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent == null)
                        return _responseHandler.BadRequest<object>("Event data object is not a PaymentIntent.");

                    _logger.LogInformation($"PaymentIntent succeeded for: {paymentIntent.Id}");

                    var orderId = paymentIntent.Metadata.ContainsKey("orderId") ? paymentIntent.Metadata["orderId"] : null;
                    if (orderId == null)
                        return _responseHandler.BadRequest<object>("Missing orderId in metadata.");

                    var order = await _context.Order.FirstOrDefaultAsync(b => b.Id == orderId);
                    if (order == null)
                        return _responseHandler.BadRequest<object>("Order not found.");

                    order.Status = OrderStatus.Paid;
                    await _context.SaveChangesAsync();
                }
                else if (stripeEvent.Type == "payment_intent.payment_failed")
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent != null)
                    {
                        _logger.LogWarning($"PaymentIntent failed for: {paymentIntent.Id}");

                        var orderId = paymentIntent.Metadata.ContainsKey("orderId") ? paymentIntent.Metadata["orderId"] : null;
                        if (orderId == null)
                            return _responseHandler.BadRequest<object>("Missing orderId in metadata.");

                        var order = await _context.Order.FirstOrDefaultAsync(b => b.Id == orderId);
                        if (order == null)
                            return _responseHandler.BadRequest<object>("Order not found.");

                        order.Status = OrderStatus.Canceled;
                        await _context.SaveChangesAsync();

                        if (order != null)
                        {
                            order.Status = OrderStatus.Canceled;
                            await _context.SaveChangesAsync();
                        }
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
    }
}
