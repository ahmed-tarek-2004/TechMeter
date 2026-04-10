using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.Features.Auth.Register.Command.Provider;
using TechMeter.Application.Features.Auth.Register.Command.Student;

namespace TechMeter.Application.Mapping.Auth
{
    public class RegisterProfile:Profile
    {
        public RegisterProfile() 
        {
            CreateMap<ProviderRegisterRequest, ProviderRegisterCommand>();
            CreateMap<StudentRegisterRequest, StudentRegisterCommand>();
        }
    }
}
