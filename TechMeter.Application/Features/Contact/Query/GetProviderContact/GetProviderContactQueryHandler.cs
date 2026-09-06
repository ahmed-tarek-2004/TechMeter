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
        : IRequestHandler<GetProviderContactQuery, Response<List<AvailableContactResponse>>>
    {
        public async Task<Response<List<AvailableContactResponse>>> Handle(GetProviderContactQuery request, CancellationToken cancellationToken)
        {
            var providerContacts = await context.CourseStudent
                .AsNoTracking()
                .Where(p => p.Course.ProviderId == request.ProviderId)
                .Select(p => new AvailableContactResponse
                {
                    Id = p.Student.Id,
                    Name = p.Student.User.UserName ?? "",
                    UserProfilePictureUrl = p.Student.User.ProfileUrl ?? ""
                })
                .ToListAsync(cancellationToken);
            return responseHandler.Success(providerContacts, "Provider contacts retrieved successfully"); 
        }
    }
}
