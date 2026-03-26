using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.User;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Profile.Command.EditProviderProfile
{
    public sealed record ProviderProfileCommand(string providerId , EditProviderProfileRequest Request): IRequest<Response<string>>;
}
