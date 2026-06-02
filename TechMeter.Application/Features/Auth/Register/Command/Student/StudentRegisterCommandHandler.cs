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
    public class StudentRegisterCommandHandler(IAuthService authService) : IRequestHandler<StudentRegisterCommand, Response<StudentRegisterResponse>>
    {
        public async Task<Response<StudentRegisterResponse>> Handle(StudentRegisterCommand request, CancellationToken cancellationToken)
        {
            return await authService.RegisterAsStudentAsync(request.StudentRegisterRequest);
        }
    }
}
