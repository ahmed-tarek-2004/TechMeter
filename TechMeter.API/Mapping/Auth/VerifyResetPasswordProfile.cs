using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Features.Auth.ConfirmResetPassword;
using TechMeter.Application.Features.Auth.ResetPassword;

namespace TechMeter.Application.Mapping.Auth
{
    public class VerifyResetPasswordProfile:Profile
    {
        public VerifyResetPasswordProfile() 
        {
            CreateMap<DTO.Otp.VerifyOtp, ConfirmResetPasswordCommand>();
                
        }
    }
}
