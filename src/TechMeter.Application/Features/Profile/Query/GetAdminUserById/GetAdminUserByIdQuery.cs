using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Profile;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Query.GetAdminUserById
{
    public sealed record GetAdminUserByIdQuery(string userId) : IRequest<Response<GetAdminUsersResponse>>;
}
