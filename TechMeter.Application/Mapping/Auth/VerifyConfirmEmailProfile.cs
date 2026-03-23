using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Features.Auth.ConfirmEmail;

namespace TechMeter.Application.Mapping.Auth
{
    public class VerifyConfirmEmailProfile:Profile
    {
        public VerifyConfirmEmailProfile() 
        {
            CreateMap<DTO.Otp.VerifyOtp, ConfirmEmailCommand>();
                
        }
    }
}
