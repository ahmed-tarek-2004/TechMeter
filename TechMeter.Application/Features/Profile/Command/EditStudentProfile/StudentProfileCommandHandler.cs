using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.EditStudentProfile
{
    public class StudentProfileCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        IMediaUploading imageUploading) : IRequestHandler<StudentProfileCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(StudentProfileCommand request, CancellationToken cancellationToken)
        {
            var student = await context.Student.Include(b => b.User).FirstOrDefaultAsync(p => p.Id == request.studnetId);
            if (student == null)
            {
                return responseHandler.NotFound<string>("student not found");
            }
            try
            {
                //Name
                if (!string.IsNullOrEmpty(request.EditStudentProfileRequest.StudentName))
                {
                    student.User.UserName = request.EditStudentProfileRequest.StudentName;
                }
                //Email
                if (!string.IsNullOrEmpty(request.EditStudentProfileRequest.Email))
                {
                    student.User.Email = request.EditStudentProfileRequest.Email;
                }
                //phone
                if (!string.IsNullOrEmpty(request.EditStudentProfileRequest.PhoneNumber))
                {
                    student.User.PhoneNumber = request.EditStudentProfileRequest.PhoneNumber;
                }
                //counry
                if (!string.IsNullOrEmpty(request.EditStudentProfileRequest.Country))
                {
                    student.User.Country = request.EditStudentProfileRequest.Country;
                }
                //EducationLevel
                if (!string.IsNullOrEmpty(request.EditStudentProfileRequest.EducationLevel))
                {
                    student.EducationLevel = request.EditStudentProfileRequest.EducationLevel;
                }
                //birthday
                if (request.EditStudentProfileRequest.BirthDay.HasValue)
                {
                    student.BirthDate = request.EditStudentProfileRequest.BirthDay.Value;
                }
                string profileUrl = string.Empty;
                if (request.EditStudentProfileRequest.profileImage != null)
                {
                    profileUrl = await imageUploading.UploadAsync(request.EditStudentProfileRequest.profileImage);
                }
                student.User.ProfileUrl = profileUrl;
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
