using System;
using TechMeter.Application.DTO.Payment;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Payment
{
    public interface IPaymentService
    {
        Task<Response<PaymentResponse>> CreateACheckOut(string UserId, PaymentRequest paymentRequest);
        Task<Response<object>> HandleWebHookAsync(string json, string stripeSignature);
        Task<Response<PaymentIntentResponse>> PaymentIntentService(string studentId, PaymentRequest request);
        Task<Response<PaginatedList<TransactionResponse>>> GetAllAdminTransaction(DateTime? from, DateTime? to, int pageNumber = 1, int pageSize = 10);
        Task<Response<PaginatedList<TransactionResponse>>> GetAllProviderTransaction(string providerId, DateTime? from, DateTime? to, int pageNumber = 1, int pageSize = 10);
    }
}
