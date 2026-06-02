using AutoMapper;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Payment.Command.Checkout;

namespace TechMeter.API.Mapping.Payment
{
    public class CheckoutProfile:Profile
    {
        public CheckoutProfile()
        {
            CreateMap<PaymentRequest, CheckoutCommand>()
                .ForMember(des => des.studentId, opt => opt.Ignore());
        }   
    }
}
