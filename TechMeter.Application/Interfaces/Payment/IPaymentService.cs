using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Payment;
using TechMeter.Domain.Shared.Bases;


namespace TechMeter.Application.Interfaces.Payment
{
    public interface IPaymentService
    {
        Task<Response<PaymentResponse>> CreateACheckOut(string UserId,PaymentRequest paymentRequest);
        //Task<PaymentResponse> WebHook(PaymentRequest paymentRequest);
    }
}
