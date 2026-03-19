using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Features.WishList.Command.RemoveFromWishlistItem;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.RemoveFromWishlist
{
    public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, Response<string>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        public RemoveFromWishlistCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler)
        {
            _context = context;
            _responseHandler = responseHandler;
        }

        public async Task<Response<string>> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                    .FirstOrDefaultAsync(w => w.StudentId == request.studentId, cancellationToken);

                if (wishlist == null)
                    return _responseHandler.NotFound<string>("Wishlist not found");

                var item = wishlist.WishlistItems.FirstOrDefault(i => i.Id == request.wishlistItemId);
                if (item == null)
                    return _responseHandler.NotFound<string>("Wishlist item not found");

                wishlist.WishlistItems.Remove(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                return _responseHandler.Deleted<string>("Item removed from wishlist");
            }
            catch (Exception)
            {
                return _responseHandler.InternalServerError<string>("Failed to remove item");
            }
        }
    }
}
