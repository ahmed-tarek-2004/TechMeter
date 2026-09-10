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
    public class GetStudentContactsQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler)
        : IRequestHandler<GetStudentContactsQuery, Response<PaginatedList<AvailableContactResponse>>>
    {
        public async Task<Response<PaginatedList<AvailableContactResponse>>> Handle(GetStudentContactsQuery request, CancellationToken cancellationToken)
        {
            var userContactsQuery = context.Provider
                  .AsNoTracking()
                  .Where(p => context.CourseStudent.Any(cs => cs.StudentId == request.StudentId && cs.Course.ProviderId == p.Id))
                  .Select(p => new AvailableContactResponse
                  {
                      Id = p.Id,
                      Name = p.User.UserName ?? "",
                      UserProfilePictureUrl = p.User.ProfileUrl ?? ""
                  });
            var userContacts = await PaginatedList<AvailableContactResponse>.CreatePaginatedList(userContactsQuery, request.PageNumber, request.PageSize, cancellationToken);
            return responseHandler.Success(userContacts, "Student contacts retrieved successfully");
        }


    }
}
