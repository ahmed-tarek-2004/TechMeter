using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetAdminUsers
{
    public sealed record class GetAdminUsersCommand(string AdminId, int pageNumber, int pageSize, string? name, string? role,bool? Islocked,bool? IsTwoFactorEnabled) : IRequest<Response<PaginatedList<GetAdminUsersResponse>>>;
}
