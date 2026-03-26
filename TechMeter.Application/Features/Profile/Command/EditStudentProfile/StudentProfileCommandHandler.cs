using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using TechMeter.Application.Features.Student.Command;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.EditStudentProfile
{
    public class StudentProfileCommandHandler(IProfileService profileService) : IRequestHandler<StudentProfileCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(StudentProfileCommand request, CancellationToken cancellationToken)
        {
            return await profileService.EditStudentProfileAsync(request.studnetId, request.Request);
        }
    }
}
