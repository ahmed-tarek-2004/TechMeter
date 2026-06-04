using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Cart
{
    public class CartService : ICartService
    {
        private ApplicationDbContext _context;
        private readonly ILogger<CartService> _logger;
        private readonly ResponseHandler _responseHandler;
        public CartService(ILogger<CartService> logger, ApplicationDbContext context,
            ResponseHandler responseHandler)
        {
            _logger = logger;
            _context = context;
            _responseHandler = responseHandler;
        }
        public async Task<Response<CartResponse>> GetCartAsync(string StudentId)
        {
            var user = await _context.Student.FirstOrDefaultAsync(b => b.Id == StudentId);
            if (user == null)
            {
                return _responseHandler.NotFound<CartResponse>("User Not Found");
            }
            try
            {
                var cart = _context.Cart
                        .Where(c => c.StudentId == StudentId)
                        .AsNoTracking()
                        .AsQueryable();

                var response = await CreateCartResponse(cart);
                if (response.Items?.Any() != true)
                {
                    var cartResponse = new CartResponse()
                    {
                        CartId = Guid.Empty.ToString(),
                        CreatedAt = DateTime.Now,
                        TotalItems = 0,
                        TotalPrice = 0,
                        Items = new List<CartItemResponse>(),
                    };
                    return _responseHandler.Success(cartResponse, "Cart Is Empty");
                }
                return _responseHandler.Success(response, "Cart Returned Successfully");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return _responseHandler.InternalServerError<CartResponse>("Internal Server Error");
            }

        }
        public async Task<Response<CartResponse>> GetProviderCartAsync(string sellerId, string StudentId)
        {
            var Student = await _context.Student.FindAsync(StudentId);
            if (Student == null)
            {
                return _responseHandler.NotFound<CartResponse>("Student Not Found");
            }
            var Cart = _context.Cart
                .Where(c => c.StudentId == StudentId && c.CartItems.Any(ci => ci.Course.ProviderId == sellerId))
                .AsNoTracking()
                .AsQueryable();

            var cartResponse = await CreateCartResponse(Cart);
            if(cartResponse.Items?.Any() != true)
            {
                cartResponse = new CartResponse()
                {
                    CartId = Guid.Empty.ToString(),
                    CreatedAt = DateTime.Now,
                    TotalItems = 0,
                    TotalPrice = 0,
                    Items = new List<CartItemResponse>(),
                };
                return _responseHandler.Success(cartResponse, $"Cart For Student {StudentId} is Empty for this provider");
            }

            return _responseHandler.Success(cartResponse, $"Cart For Student {StudentId} return successfully");
        }
        public async Task<Response<string>> AddToCartAsync(string studentId, string courseId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Course = await _context.Course.FirstOrDefaultAsync(p => p.Id == courseId);
                if (Course == null)
                {
                    return _responseHandler.BadRequest<string>("Course is not found");
                }


                var cart = await _context.Cart
                    .Include(b => b.CartItems)
                    //.ThenInclude(b => b.Course)
                    .FirstOrDefaultAsync(c => c.StudentId == studentId);

                if (cart == null)
                {
                    cart = new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        StudentId = studentId,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                    };
                    await _context.AddAsync(cart);
                }
                if (cart.CartItems == null)
                {
                    cart.CartItems = new List<CartItem>();
                }
                var existingCartItem = cart.CartItems.Any(b => b.CourseId == courseId);
                if (existingCartItem == false)
                {
                    var CartItem = new CartItem()
                    {
                        Id = Guid.NewGuid().ToString(),
                        CourseId = courseId,
                        UnitPrice = Course.Price,
                        CreatedAt = DateTime.Now,
                        CartId = cart.Id,
                    };
                    cart.CartItems.Add(CartItem);
                    //await _context.AddAsync(CartItem);
                }
                else
                {
                    return _responseHandler.BadRequest<string>($"course {courseId} already in the cart for this student");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Success(string.Empty, "Course Add To Cart Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex.Message);
                return _responseHandler.InternalServerError<string>(ex.Message);
            }

        }
        public async Task<Response<string>> RemoveFromCartAsync(string StudentId, string cartItemId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cartItem = await _context.CartItem.Include(b=>b.Cart).FirstOrDefaultAsync(b=>b.Id== cartItemId && b.Cart.StudentId == StudentId);
                if (cartItem == null)
                {
                    _logger.LogWarning("CartItem not found for StudentId: {StudentId}", StudentId);
                    return _responseHandler.NotFound<string>("no CartItem has found for student.");
                }
               
                _context.CartItem.Remove(cartItem);
                cartItem.Cart.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                //var response = CreateCartResponse(cart);
                _logger.LogInformation("Cart item removed successfully for StudentId: {StudentId}", StudentId);
                return _responseHandler.Deleted<string>("Cart item removed successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while removing cart item for StudentId: {StudentId}", StudentId);
                return _responseHandler.InternalServerError<string>("An error occurred while removing cart item.");
            }
        }
        public async Task<Response<string>> ClearStudentCartAsync(string StudentId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var existingUser = await _context.Student.AnyAsync(b => b.Id == StudentId);
            if (!existingUser)
            {
                _logger.LogWarning("Student not found for StudentId: {StudentId}", StudentId);
                return _responseHandler.NotFound<string>("Student not found.");
            }
            try
            {
                var rows = await _context.CartItem
                    .Where(ci => ci.Cart.StudentId == StudentId)
                    .ExecuteDeleteAsync();
                if(rows == 0)
                {
                    _logger.LogWarning("No cart items found to delete for StudentId: {StudentId}", StudentId);
                    return _responseHandler.NotFound<string>("No cart items found to delete.");
                }
                rows = await _context.Cart
                    .Where(c => c.StudentId == StudentId)
                    .ExecuteUpdateAsync(c => c.SetProperty(p => p.UpdatedAt, DateTime.UtcNow));
                await transaction.CommitAsync();


                _logger.LogInformation("Cart item removed successfully for StudentId: {StudentId}", StudentId);
                return _responseHandler.Deleted<string>("Cart item removed successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while removing cart item for StudentId: {StudentId}", StudentId);
                return _responseHandler.InternalServerError<string>("An error occurred while removing cart item.");
            }
        }
       
        //public async Task<Response<CartResponse>> UpdateCartAsync(string StudentId, UpdateCartItemRequest request)
        //{
        //    var transaction = await _context.Database.BeginTransactionAsync();
        //    try
        //    {
        //        var cart = await _context.Cart
        //            .Include(b => b.CartItems)
        //            .ThenInclude(b => b.Course)
        //            .FirstOrDefaultAsync(b => b.StudentId == StudentId);
        //        if (cart == null)
        //        {
        //            _logger.LogWarning("Cart not found for StudentId: {StudentId}", StudentId);
        //            return _responseHandler.NotFound<CartResponse>("Cart not found.");
        //        }
        //        var cartItem = cart.CartItems.FirstOrDefault(b => b.Id == request.CartItemId);
        //        if (cartItem == null)
        //        {
        //            _logger.LogWarning("CartItem not found. CartItemId: {CartItemId}", request.CartItemId);
        //            return _responseHandler.NotFound<CartResponse>("Cart item not found.");
        //        }

        //        cart.UpdatedAt = DateTime.UtcNow;

        //        await _context.SaveChangesAsync();

        //        await transaction.CommitAsync();
        //        var response = CreateCartResponse(cart);
        //        _logger.LogInformation("Cart item quantity updated successfully for StudentId: {StudentId}", StudentId);
        //        return _responseHandler.Success(response, "Cart item quantity updated successfully.");
        //    }
        //    catch (Exception ex)
        //    {
        //        await transaction.RollbackAsync();
        //        _logger.LogError(ex, "Error occurred while updating cart item quantity for StudentId: {StudentId}", StudentId);
        //        return _responseHandler.InternalServerError<CartResponse>("An error occurred while updating cart item quantity.");
        //    }

        //}
        private async Task<CartResponse> CreateCartResponse(IQueryable<Domain.Models.Cart> cart)
        {
            var response = await cart.Select(c => new CartResponse()
            {
                CartId = c.Id,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Items = c.CartItems.Select(ci => new CartItemResponse()
                {
                    Id = ci.Id,
                    CourseId = ci.CourseId,
                    CourseName = ci.Course.Title,
                    UnitPrice = ci.UnitPrice,
                    CreatedAt = ci.CreatedAt
                }).ToList(),
                TotalItems = c.CartItems.Count(),
                TotalPrice = c.CartItems.Sum(b => b.UnitPrice)
            }).FirstOrDefaultAsync();

            return response ?? new CartResponse();
        }


    }
}
