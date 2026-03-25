using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.Login;
using TechMeter.Application.Features.Auth.Login.Command;

namespace TechMeter.Application.Mapping.Auth
{
    public class LoginProfile : Profile
    {
        public LoginProfile()
        {
            CreateMap<LoginRequestDto, LoginCommand>();
        }
    }
}
