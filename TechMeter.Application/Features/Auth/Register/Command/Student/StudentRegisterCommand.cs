using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Register.Command.Student
{
    public sealed record StudentRegisterCommand(string UserName, string Email, string PhoneNumber,
        string Password, string PassworfConfirmed, string Country, IFormFile? ProfilePhoto,
        Gender Gender, DateTime BirthDate, string EducationLevel) : IRequest<Response<StudentRegisterResponse>>;
}
