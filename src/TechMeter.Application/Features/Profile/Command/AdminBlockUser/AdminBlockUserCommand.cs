using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.AdminBlockUser
{
    public sealed record AdminBlockUserCommand(string userId) : IRequest<Response<string>>;
}
