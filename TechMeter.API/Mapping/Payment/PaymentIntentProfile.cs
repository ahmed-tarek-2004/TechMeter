using AutoMapper;
using TechMeter.Application.DTO.Payment;
using TechMeter.Application.Features.Payment.Command.PaymentIntent;

namespace TechMeter.API.Mapping.Payment
{
    public class PaymentIntentProfile:Profile
    {
        public PaymentIntentProfile()
        {
            CreateMap<PaymentRequest, PaymentIntentCommand>()
                .ForMember(des => des.studentId, opt => opt.Ignore());

        }
    }
}
