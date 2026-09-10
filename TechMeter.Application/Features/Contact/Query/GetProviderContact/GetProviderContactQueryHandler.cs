using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Contact;
using Microsoft.EntityFrameworkCore;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Contact.Query.GetProviderContact
{
    public class GetProviderContactQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler)
        : IRequestHandler<GetProviderContactQuery, Response<PaginatedList<AvailableContactResponse>>>
    {
        public async Task<Response<PaginatedList<AvailableContactResponse>>> Handle(GetProviderContactQuery request, CancellationToken cancellationToken)
        {
            var providerContactsQuery = context.Student
                       .AsNoTracking()
                       .Where(student => student.CourseStudent.Any(cs => cs.Course.ProviderId == request.ProviderId))
                       .Select(student => new AvailableContactResponse
                       {
                           Id = student.Id,
                           Name = student.User.UserName ?? "",
                           UserProfilePictureUrl = student.User.ProfileUrl ?? ""
                       });
            var providerContacts = await PaginatedList<AvailableContactResponse>.CreatePaginatedList(providerContactsQuery, request.PageNumber, request.PageSize, cancellationToken);
            return responseHandler.Success(providerContacts, "Provider contacts retrieved successfully");
        }
    }
}
