using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Contact;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Contact.Query.GetProviderContact
{
    public sealed record GetProviderContactQuery(string ProviderId,int PageNumber,int PageSize) : IRequest<Response<PaginatedList<AvailableContactResponse>>>;
}
