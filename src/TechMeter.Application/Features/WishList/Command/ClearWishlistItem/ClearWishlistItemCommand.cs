using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.ClearWishlistItem
{
    public sealed record ClearWishlistItemCommand(string studentId) : IRequest<Response<string>>;
}
