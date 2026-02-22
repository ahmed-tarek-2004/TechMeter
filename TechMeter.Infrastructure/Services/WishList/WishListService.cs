using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.WishList
{
    public class WishListService : IWishListService
    {

        private readonly ApplicationDbContext _context;
        private readonly ILogger<WishListService> _logger;
        private readonly ResponseHandler _responseHandler;

        public WishListService(
            ILogger<WishListService> logger,
            ApplicationDbContext context,
            ResponseHandler responseHandler)
        {
            _logger = logger;
            _context = context;
            _responseHandler = responseHandler;
        }
        public async Task<Response<GetWishListResponse>> AddToWishlistAsync(string studentId, AddToWishListRequest request)
        {
            var student = await _context.Student.FindAsync(studentId);
            if (student == null)
            {
                return _responseHandler.NotFound<GetWishListResponse>("Stuend is not found");
            }
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Course = await _context.Course
                    //.Include(p => p.)
                    .FirstOrDefaultAsync(p => p.Id == request.CourseId);

                if (Course == null)
                    return _responseHandler.NotFound<GetWishListResponse>("Course not found");

                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                    .FirstOrDefaultAsync(w => w.StudentId == studentId);

                if (wishlist == null)
                {
                    wishlist = new Wishlist
                    {
                        Id = Guid.NewGuid().ToString(),
                        StudentId = studentId,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow
                    };
                    _context.Wishlist.Add(wishlist);
                }

                if (wishlist.WishlistItems.Any(wi => wi.courseId == request.CourseId))
                    return _responseHandler.BadRequest<GetWishListResponse>("Course is already in wishlist");

                var item = new WishlistItem
                {
                    Id = Guid.NewGuid().ToString(),
                    WishlistId = wishlist.Id,
                    courseId = request.CourseId,
                    CreatedAt = DateTime.UtcNow
                };

                wishlist.WishlistItems.Add(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = CreateWishlistResponse(wishlist);

                return _responseHandler.Success(response, "Course added to wishlist");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetWishListResponse>("Failed to add Course to wishlist");
            }
        }

        public async Task<Response<object>> ClearWishlistAsync(string studentId)
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                    .FirstOrDefaultAsync(w => w.StudentId == studentId);

                if (wishlist == null || !wishlist.WishlistItems.Any())
                    return _responseHandler.Success<object>(null, "Wishlist is already empty");

                _context.WishlistItem.RemoveRange(wishlist.WishlistItems);
                wishlist.WishlistItems.Clear();
                wishlist.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return _responseHandler.Deleted<object>("Wishlist cleared successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error clearing wishlist for Student {StudentId}", studentId);
                return _responseHandler.InternalServerError<object>("Failed to clear wishlist");
            }
        }

        public async Task<Response<GetWishListResponse>> GetWishlistAsync(string studentId)
        {
            try
            {
                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                        .ThenInclude(wi => wi.Course)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(w => w.StudentId == studentId);

                if (wishlist == null || !wishlist.WishlistItems.Any())
                {
                    var empty = new GetWishListResponse
                    {
                        Id = Guid.Empty.ToString(),
                        StudentId = studentId,
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
                _logger.LogError(ex, "Error retrieving wishlist for client {ClientId}", studentId);
                return _responseHandler.InternalServerError<GetWishListResponse>("Failed to retrieve wishlist");
            }
        }

        public async Task<Response<GetWishListResponse>> RemoveFromWishlistAsync(string studentId, string wishlistItemId)
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                        .ThenInclude(wi => wi.Course)
                    .FirstOrDefaultAsync(w => w.StudentId == studentId);

                if (wishlist == null)
                    return _responseHandler.NotFound<GetWishListResponse>("Wishlist not found");

                var item = wishlist.WishlistItems.FirstOrDefault(i => i.Id == wishlistItemId);
                if (item == null)
                    return _responseHandler.NotFound<GetWishListResponse>("Wishlist item not found");

                wishlist.WishlistItems.Remove(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                _context.WishlistItem.Remove(item);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = CreateWishlistResponse(wishlist);
                return _responseHandler.Deleted<GetWishListResponse>("Item removed from wishlist");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetWishListResponse>("Failed to remove item");
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
