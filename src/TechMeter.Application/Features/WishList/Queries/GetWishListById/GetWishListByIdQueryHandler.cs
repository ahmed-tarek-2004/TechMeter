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
                var wishlist = await context.Wishlist
                    .Include(w => w.WishlistItems)
                    .ThenInclude(wi => wi.Course)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.StudentId == request.studentId, cancellationToken);

                if (wishlist == null || wishlist.WishlistItems == null || !wishlist.WishlistItems.Any())
                {
                    var empty = new GetWishListResponse
                    {
                        Id = wishlist?.Id ?? Guid.Empty.ToString(),
                        StudentId = request.studentId,
                        CreatedAt = wishlist?.CreatedAt ?? DateTime.UtcNow,
                        LastUpdated = wishlist?.LastUpdated ?? DateTime.UtcNow,
                        Items = new List<WishListItemResponse>()
                    };
                    return responseHandler.Success(empty, "Wishlist is empty");
                }

                var response = new GetWishListResponse
                {
                    Id = wishlist.Id,
                    StudentId = wishlist.StudentId,
                    CreatedAt = wishlist.CreatedAt,
                    LastUpdated = wishlist.LastUpdated,
                    Items = wishlist.WishlistItems.Select(wi => new WishListItemResponse
                    {
                        Id = wi.Id,
                        CourseId = wi.courseId,
                        AddedAt = wi.CreatedAt,
                        CourseName = wi.Course?.Title ?? string.Empty,
                        CourseImageUrl = wi.Course?.CourseProfileImageUrl ?? string.Empty,
                        Price = wi.Course?.Price ?? 0
                    }).ToList()
                };

                return responseHandler.Success(response, "Wishlist retrieved successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving wishlist for client {ClientId}", request.studentId);
                return responseHandler.InternalServerError<GetWishListResponse>("Failed to retrieve wishlist");
            }
        }
    }
}
