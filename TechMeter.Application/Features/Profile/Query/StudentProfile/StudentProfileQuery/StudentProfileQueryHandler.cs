using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.StudentProfile.StudentProfileQuery
{
    public class StudentProfileQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<StudentProfileQuery, Response<GetStudentProfileInfoResponse>>
    {
        public async Task<Response<GetStudentProfileInfoResponse>> Handle(StudentProfileQuery request, CancellationToken cancellationToken)
        {
            var response = await context.Student.Where(b => b.Id == request.Id).Select(b => new GetStudentProfileInfoResponse
            {
                Id = b.Id,
                BirthDay = b.BirthDate,
                Country = b.User.Country,
                EducationLevel = b.EducationLevel,
                Email = b.User.Email,
                PhoneNumber = b.User.PhoneNumber,
                profileImage = b.User.ProfileUrl,
                StudentName = b.User.UserName,

            }).FirstOrDefaultAsync();
            return responseHandler.Success(response, "Student info retrieved successfully");
        }
    }
}
