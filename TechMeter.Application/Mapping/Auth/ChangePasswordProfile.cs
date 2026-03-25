using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.ResetPassword;
using TechMeter.Application.Features.Auth.ChangePassword;

namespace TechMeter.Application.Mapping.Auth
{
    public class ChangePasswordProfile:Profile
    {
        public ChangePasswordProfile()
        {
            CreateMap<ChangePassword, ChangePasswordCommand>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore());
        }
    }
}
