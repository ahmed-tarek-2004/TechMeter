using System;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Payment.Command.Checkout;
using TechMeter.Application.Features.Payment.Command.PaymentIntent;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Services.Payment
{
    public interface IPaymentService
    {
        Task<Response<PaymentResponse>> CreateACheckOut(CheckoutCommand command);
        Task<Response<object>> HandleWebHookAsync(string json, string stripeSignature);
        Task<Response<PaymentIntentResponse>> PaymentIntentService(PaymentIntentCommand request);
        Task<Response<PaginatedList<TransactionResponse>>> GetAllAdminTransaction(string? providerId, DateTime? from, DateTime? to, int pageNumber = 1, int pageSize = 10);
        Task<Response<PaginatedList<TransactionResponse>>> GetAllProviderTransaction(string providerId, DateTime? from, DateTime? to, int pageNumber = 1, int pageSize = 10);
    }
}
