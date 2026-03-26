using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Application.Interfaces.UserProfile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.StudentProfile.StudentProfileQuery
{
    public class StudentProfileQueryHandler(IProfileService profileService) : IRequestHandler<StudentProfileQuery, Response<GetStudentProfileInfoResponse>>
    {
        public async Task<Response<GetStudentProfileInfoResponse>> Handle(StudentProfileQuery request, CancellationToken cancellationToken)
        {
            return await profileService.GetStudentInfoResponseAsync(request.Id);
        }
    }
}
