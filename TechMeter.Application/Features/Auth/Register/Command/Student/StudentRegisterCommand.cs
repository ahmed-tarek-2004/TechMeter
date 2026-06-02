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
    public sealed record StudentRegisterCommand(StudentRegisterRequest StudentRegisterRequest) : IRequest<Response<StudentRegisterResponse>>;
}
