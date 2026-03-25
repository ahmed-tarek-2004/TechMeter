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
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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
        public async Task<Response<string>> AddToWishlistAsync(string studentId, string request)
        {
            var student = await _context.Student.FindAsync(studentId);
            if (student == null)
            {
                return _responseHandler.NotFound<string>("student is not found");
            }
            var Course = await _context.Course
                //.Include(p => p.)
                .FirstOrDefaultAsync(p => p.Id == request);
            if (Course == null)
                return _responseHandler.NotFound<string>("Course not found");

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

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
                    await _context.Wishlist.AddAsync(wishlist);
                }
                else
                {
                    if (wishlist.WishlistItems.Any(wi => wi.courseId == request))
                        return _responseHandler.BadRequest<string>("Course is already in wishlist");
                }

                var item = new WishlistItem
                {
                    Id = Guid.NewGuid().ToString(),
                    WishlistId = wishlist.Id,
                    courseId = request,
                    CreatedAt = DateTime.UtcNow
                };

                wishlist.WishlistItems.Add(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();


                return _responseHandler.Success(string.Empty, $"Course {Course.Title} added to wishlist");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>("Failed to add Course to wishlist");
            }
        }

        public async Task<Response<string>> ClearWishlistAsync(string studentId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var rows = await _context.WishlistItem.Where(b => b.Wishlist.StudentId == studentId).ExecuteDeleteAsync();
                if (rows == 0)
                {
                    return _responseHandler.Success<string>(null, "Wishlist is already empty");
                }
                await _context.Wishlist.Where(b => b.StudentId == studentId)
                    .ExecuteUpdateAsync(b => b.SetProperty(p => p.LastUpdated, DateTime.UtcNow));

                await transaction.CommitAsync();

                return _responseHandler.Deleted<string>("Wishlist cleared successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error clearing wishlist for Student {StudentId}", studentId);
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        public async Task<Response<GetWishListResponse>> GetWishlistAsync(string studentId)
        {
            try
            {
                var wishlistItem = await _context.WishlistItem
                    .Where(b => b.Wishlist.StudentId == studentId)
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
                        StudentId = studentId,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow,
                        Items = new List<WishListItemResponse>()
                    };
                    return _responseHandler.Success(empty, "Wishlist is empty");
                }

                //var dto = CreateWishlistResponse(wishlist);
                return _responseHandler.Success(wishlistItem, "Wishlist retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving wishlist for client {ClientId}", studentId);
                return _responseHandler.InternalServerError<GetWishListResponse>("Failed to retrieve wishlist");
            }
        }

        public async Task<Response<string>> RemoveFromWishlistAsync(string studentId, string wishlistItemId)
        {
            try
            {
                var wishlist = await _context.Wishlist
                    .Include(w => w.WishlistItems)
                    .FirstOrDefaultAsync(w => w.StudentId == studentId);

                if (wishlist == null)
                    return _responseHandler.NotFound<string>("Wishlist not found");

                var item = wishlist.WishlistItems.FirstOrDefault(i => i.Id == wishlistItemId);
                if (item == null)
                    return _responseHandler.NotFound<string>("Wishlist item not found");

                wishlist.WishlistItems.Remove(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return _responseHandler.Deleted<string>("Item removed from wishlist");
            }
            catch (Exception)
            {
                return _responseHandler.InternalServerError<string>("Failed to remove item");
            }
        }
    }
}
