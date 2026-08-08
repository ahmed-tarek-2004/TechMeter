using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.WishList;
//using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.ClearWishlistItem
{
    public class ClearWishlistItemCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<ClearWishlistItemCommand, Response<string>>
    {

        public async Task<Response<string>> Handle(ClearWishlistItemCommand request, CancellationToken cancellationToken)
        {
            try
            {

                var rows = await context.WishlistItem
                    .Where(b => b.Wishlist.StudentId == request.studentId)
                    .ExecuteDeleteAsync();
                if (rows == 0)
                {
                    return responseHandler.Success<string>(null, "Wishlist is already empty");
                }
                await context.Wishlist
                    .Where(b => b.StudentId == request.studentId)
                    .ExecuteUpdateAsync(b => b.SetProperty(p => p.LastUpdated, DateTime.UtcNow));


                return responseHandler.Deleted<string>("Wishlist cleared successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error clearing wishlist for Student {StudentId}", request.studentId);
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
