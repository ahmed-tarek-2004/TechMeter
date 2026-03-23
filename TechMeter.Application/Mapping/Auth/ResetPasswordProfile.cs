using AutoMapper;
using Microsoft.AspNetCore.Identity.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Features.Auth.ResetPassword;

namespace TechMeter.Application.Mapping.Auth
{
    public class ResetPasswordProfile:Profile
    {
        public ResetPasswordProfile()
        {
            CreateMap<ResetPasswordRequest, ResetPasswordCommand>();
        }
    }
}
