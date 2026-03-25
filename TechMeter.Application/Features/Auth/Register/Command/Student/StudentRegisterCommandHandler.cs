using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Auth.Register;
using TechMeter.Application.Interfaces.AuthService;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.Register.Command.Student
{
    public class StudentRegisterCommandHandler : IRequestHandler<StudentRegisterCommand, Response<StudentRegisterResponse>>
    {
        private readonly IAuthService _authService;
        public StudentRegisterCommandHandler(IAuthService authService) 
        {
            _authService = authService;
        }
        public async Task<Response<StudentRegisterResponse>> Handle(StudentRegisterCommand request, CancellationToken cancellationToken)
        {
            return await _authService.RegisterAsStudentAsync(request);
        }
    }
}
