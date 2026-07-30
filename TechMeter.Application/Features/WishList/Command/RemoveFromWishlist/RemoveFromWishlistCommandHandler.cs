using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.WishList.Command.RemoveFromWishlistItem;
//using TechMeter.Application.Interfaces.Services.WishList;
//using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.RemoveFromWishlist
{
    public class RemoveFromWishlistCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<RemoveFromWishlistCommand, Response<string>>
    {
       
        public async Task<Response<string>> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var wishlist = await context.Wishlist
                    .Include(w => w.WishlistItems)
                    .FirstOrDefaultAsync(w => w.StudentId == request.studentId);

                if (wishlist == null)
                    return responseHandler.NotFound<string>("Wishlist not found");

                var item = wishlist.WishlistItems.FirstOrDefault(i => i.Id == request.wishlistItemId);
                if (item == null)
                    return responseHandler.NotFound<string>("Wishlist item not found");

                wishlist.WishlistItems.Remove(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                await context.SaveChangesAsync(cancellationToken);

                return responseHandler.Deleted<string>("Item removed from wishlist");
            }
            catch (Exception)
            {
                return responseHandler.InternalServerError<string>("Failed to remove item");
            }
        }
    }
}
