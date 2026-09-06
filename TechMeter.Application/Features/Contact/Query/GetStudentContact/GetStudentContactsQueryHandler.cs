using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Contact;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Contact.Query.GetStudentContact
{
    public class GetStudentContactsQueryHandler(IApplicationDbContext context,ResponseHandler responseHandler) : IRequestHandler<GetStudentContactsQuery, Response<List<AvailableContactResponse>>>
    {
        public async Task<Response<List<AvailableContactResponse>>> Handle(GetStudentContactsQuery request, CancellationToken cancellationToken)
        {
           var userContacts = await context.CourseStudent
                .AsNoTracking()
                .Where(c => c.StudentId == request.StudentId)
                .Select(c => new AvailableContactResponse
                {
                    Id = c.Course.ProviderId,
                    Name = c.Course.Provider.User.UserName??"",
                    UserProfilePictureUrl = c.Course.Provider.User.ProfileUrl??""
                })
                .ToListAsync(cancellationToken);
            return responseHandler.Success(userContacts,"Student contacts retrieved successfully");
        }

       
    }
}
