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
//using TechMeter.Application.Interfaces.Services.WishList;
//using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Queries.GetWishListById
{
    public class GetWishListByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<GetWishListByIdQuery, Response<GetWishListResponse>>
    {
        public async Task<Response<GetWishListResponse>> Handle(GetWishListByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var wishlistItem = await context.WishlistItem
                    .Where(b => b.Wishlist.StudentId == request.studentId)
                    .Select(b => new GetWishListResponse
                    {
                        Id = b.WishlistId,
                        StudentId = b.Wishlist.StudentId,
                        CreatedAt = b.Wishlist.CreatedAt,
                        LastUpdated = b.Wishlist.LastUpdated,
                        Items = new List<WishListItemResponse>
                        {
                            new WishListItemResponse
                            {
                                Id = b.Id,
                                CourseId = b.courseId,
                                AddedAt = b.CreatedAt
                            }
                        }

                    }).FirstOrDefaultAsync();

                if (wishlistItem == null)
                {
                    var empty = new GetWishListResponse
                    {
                        Id = Guid.Empty.ToString(),
                        StudentId = request.studentId,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow,
                        Items = new List<WishListItemResponse>()
                    };
                    return responseHandler.Success(empty, "Wishlist is empty");
                }

                //var dto = CreateWishlistResponse(wishlist);
                return responseHandler.Success(wishlistItem, "Wishlist retrieved successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving wishlist for client {ClientId}", request.studentId);
                return responseHandler.InternalServerError<GetWishListResponse>("Failed to retrieve wishlist");
            }
        }
    }
}
