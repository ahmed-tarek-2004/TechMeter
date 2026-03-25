using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.RemoveFromWishlistItem
{
    public sealed record RemoveFromWishlistCommand(string studentId ,string wishlistItemId) : IRequest<Response<string>>;
}
