using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Interfaces.Payment;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;
using static System.Net.WebRequestMethods;

namespace TechMeter.Infrastructure.Services.Payment
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;

        public PaymentService(ApplicationDbContext context, ResponseHandler responseHandler)
        {
            _context = context;
            _responseHandler = responseHandler;
        }
        public async Task<Response<PaymentResponse>> CreateACheckOut(string studentId, PaymentRequest request)
        {
            var user = await _context.Users.FindAsync(studentId);
            if (user == null)
            {
                return _responseHandler.BadRequest<PaymentResponse>("User is not found");
            }
            var order = await _context.Order
                .Include(b => b.OrderItems)
                .ThenInclude(b => b.Course)
                .FirstOrDefaultAsync(b => b.Id == request.OrderId);
            if (order == null)
            {
                return _responseHandler.NotFound<PaymentResponse>("User is not found");
            }
            var lineItems = new List<SessionLineItemOptions>();
            foreach (var item in order.OrderItems)
            {
                lineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = request.Currency,
                        UnitAmountDecimal = item.UnitPrice,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.Course.Title,
                        },
                    },
                    Quantity = 1
                });
            }
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
            var session = service.Create(options);

            var response = new PaymentResponse()
            {
                SessionId = session.Id,
                SessionUrl = session.Url,
            };
            return _responseHandler.Success(response, "Continue to pay");
        }
    }
}
