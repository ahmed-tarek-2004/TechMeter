using Azure.Core;
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
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = request.Currency,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = request.CourseName
                        },
                    },
                },
            },
                Mode = "payment",
                SuccessUrl = request.SuccessUrl,
                CancelUrl = request.CancelUrl,
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
                SessionUrl = session.SuccessUrl
            };
            return _responseHandler.Success(response, "Continue to pay");
        }
    }
}
