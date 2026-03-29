using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Otp;

namespace TechMeter.Application.Mapping.Auth
{
    public class ResedOtpCommand : Profile
    {
        public ResedOtpCommand()
        {
            CreateMap<ResendOtp, ResedOtpCommand>();
        }
    }
}
