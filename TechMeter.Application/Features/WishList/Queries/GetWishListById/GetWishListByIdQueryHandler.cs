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
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Queries.GetWishListById
{
    public class GetWishListByIdQueryHandler : IRequestHandler<GetWishListByIdQuery, Response<GetWishListResponse>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<GetWishListByIdQueryHandler> _logger;
        public GetWishListByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<GetWishListByIdQueryHandler> logger)
        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
        }
        public async Task<Response<GetWishListResponse>> Handle(GetWishListByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                        .ThenInclude(wi => wi.Course)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(w => w.StudentId == request.studentId);

                if (wishlist == null || !wishlist.WishlistItems.Any())
                {
                    var empty = new GetWishListResponse
                    {
                        Id = Guid.Empty.ToString(),
                        StudentId = request.studentId,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow,
                        Items = new List<WishListItemResponse>()
                    };
                    return _responseHandler.Success(empty, "Wishlist is empty");
                }

                var dto = CreateWishlistResponse(wishlist);
                return _responseHandler.Success(dto, "Wishlist retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving wishlist for client {ClientId}", request.studentId);
                return _responseHandler.InternalServerError<GetWishListResponse>("Failed to retrieve wishlist");
            }
        }
        private GetWishListResponse CreateWishlistResponse(Wishlist wishlist)
        {
            return new GetWishListResponse
            {
                Id = wishlist.Id,
                StudentId = wishlist.StudentId,
                CreatedAt = wishlist.CreatedAt,
                LastUpdated = wishlist.LastUpdated,
                Items = wishlist.WishlistItems.Select(wi => new WishListItemResponse
                {
                    Id = wi.Id,
                    AddedAt = wi.CreatedAt,
                    CourseId = wi.courseId
                }).ToList()
            };
        }
    }
}
