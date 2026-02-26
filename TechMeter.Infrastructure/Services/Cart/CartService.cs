using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
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
                var cart = await _context.Cart
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                        //.ThenInclude(p => p.CourseImages.Where(image => image.isPrimary == true))
                        .AsSplitQuery()
                        .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.StudentId == StudentId);

                if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
                {
                    var cartResponse = new CartResponse()
                    {
                        CartId = Guid.Empty.ToString(),
                        CreatedAt = DateTime.Now,
                        TotalItems = 0,
                        TotalPrice = 0,
                        Items = new List<CartItemResponse>(),
                    };
                    return _responseHandler.Success<CartResponse>(cartResponse, "Cart Is Empty");
                }

                var response = CreateCartResponse(cart);
                return _responseHandler.Success<CartResponse>(response, "Cart Returned Successfully");

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
            var Cart = await _context.Cart
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Course)
                // .ThenInclude(p => p.CourseImages.Where(image => image.isPrimary == true))
                .Where(c => c.StudentId == StudentId && c.CartItems.Any(ci => ci.Course.ProviderId == sellerId))
                .AsSplitQuery()
                .AsNoTracking()
                .FirstOrDefaultAsync();
            if (Cart == null)
            {
                var response = new CartResponse()
                {
                    CartId = Guid.Empty.ToString(),
                    CreatedAt = DateTime.Now,
                    TotalItems = 0,
                    TotalPrice = 0,
                    Items = new List<CartItemResponse>(),
                };
                return _responseHandler.Success<CartResponse>(response, "Cart Is Empty");
            }
            var cartResponse = CreateCartResponse(Cart);
            return _responseHandler.Success(cartResponse, $"Cart For Student {StudentId} return successfully");
        }
        public async Task<Response<CartResponse>> AddToCartAsync(string StudentId, CartRequest request)
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Course = _context.Course.FirstOrDefault(p => p.Id == request.CourseId);
                if (Course == null)
                {
                    return _responseHandler.BadRequest<CartResponse>("Course is not found");
                }


                var cart = await _context.Cart
                    .Include(b => b.CartItems)
                    .ThenInclude(b => b.Course)
                    .FirstOrDefaultAsync(c => c.StudentId == StudentId);

                if (cart == null)
                {
                    cart = new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        StudentId = StudentId,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                    };
                    await _context.AddAsync(cart);
                }
                if (cart.CartItems == null)
                {
                    cart.CartItems = new List<CartItem>();
                }
                var existingCartItem = cart.CartItems.FirstOrDefault(b => b.CourseId == request.CourseId);
                if (existingCartItem == null)
                {
                    var CartItem = new CartItem()
                    {
                        Id = Guid.NewGuid().ToString(),
                        CourseId = request.CourseId,
                        UnitPrice = request.UnitPrice,
                        CreatedAt = DateTime.Now,
                        Cart = cart,
                    };
                    cart.CartItems.Add(CartItem);
                    await _context.AddAsync(CartItem);
                }
                else
                {

                    _context.Update(existingCartItem);
                }

                await _context.SaveChangesAsync();
                var cartResponse = CreateCartResponse(cart);
                await transaction.CommitAsync();
                return _responseHandler.Success(cartResponse, "Course Add To Cart Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex.Message);
                return _responseHandler.InternalServerError<CartResponse>("Internal Server Error");
            }

        }
        public async Task<Response<CartResponse>> RemoveFromCartAsync(string StudentId, string cartItemId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var user = await _context.Student.FirstOrDefaultAsync(b => b.Id == StudentId);
            if (user == null)
            {
                _logger.LogWarning("Student not found for StudentId: {StudentId}", StudentId);
                return _responseHandler.NotFound<CartResponse>("Student not found.");
            }
            try
            {
                var cart = await _context.Cart
               .Include(x => x.CartItems.Where(b => b.Id == cartItemId))
               .ThenInclude(c => c.Course)
               .FirstOrDefaultAsync(b => b.StudentId == StudentId);
                if (cart == null)
                {
                    _logger.LogWarning("Cart not found for StudentId: {StudentId}", StudentId);
                    return _responseHandler.NotFound<CartResponse>("Cart not found.");
                }
                var cartItem = cart.CartItems.FirstOrDefault();
                if (cartItem == null)
                {
                    _logger.LogWarning("CartItem not found. Cart: {CartId}", cart.Id);
                    return _responseHandler.NotFound<CartResponse>($"no CartItem found. Cart: {cart.Id}");
                }
                _context.CartItem.Remove(cartItem);
                cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                var response = CreateCartResponse(cart);
                _logger.LogInformation("Cart item removed successfully for StudentId: {StudentId}", StudentId);
                return _responseHandler.Deleted<CartResponse>("Cart item removed successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while removing cart item for StudentId: {StudentId}", StudentId);
                return _responseHandler.InternalServerError<CartResponse>("An error occurred while removing cart item.");
            }
        }
        public async Task<Response<CartResponse>>ClearStudentCartAsync(string StudentId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var user = await _context.Student.FirstOrDefaultAsync(b => b.Id == StudentId);
            if (user == null)
            {
                _logger.LogWarning("Student not found for StudentId: {StudentId}", StudentId);
                return _responseHandler.NotFound<CartResponse>("Student not found.");
            }
            try
            {
                var cart = await _context.Cart
               .Include(x => x.CartItems)
               .FirstOrDefaultAsync(b => b.StudentId == StudentId);
                if (cart == null)
                {
                    _logger.LogWarning("Cart not found for StudentId: {StudentId}", StudentId);
                    return _responseHandler.NotFound<CartResponse>("Cart not found.");
                }
                var cartItem = cart.CartItems.FirstOrDefault();
                if (cartItem == null)
                {
                    _logger.LogWarning("CartItem not found. Cart: {CartId}", cart.Id);
                    return _responseHandler.NotFound<CartResponse>($"no CartItem found. Cart: {cart.Id}");
                }
                if (cart.CartItems == null || !cart.CartItems.Any())
                    return _responseHandler.BadRequest<CartResponse>("Cart is already empty.");


                _context.CartItem.RemoveRange(cart.CartItems);
                cart.CartItems.Clear();
                cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

               
                _logger.LogInformation("Cart item removed successfully for StudentId: {StudentId}", StudentId);
                return _responseHandler.Deleted<CartResponse>("Cart item removed successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while removing cart item for StudentId: {StudentId}", StudentId);
                return _responseHandler.InternalServerError<CartResponse>("An error occurred while removing cart item.");
            }
        }
        public async Task<Response<CartResponse>> UpdateCartAsync(string StudentId, UpdateCartItemRequest request)
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.Cart
                    .Include(b => b.CartItems)
                    .ThenInclude(b => b.Course)
                    .FirstOrDefaultAsync(b => b.StudentId == StudentId);
                if (cart == null)
                {
                    _logger.LogWarning("Cart not found for StudentId: {StudentId}", StudentId);
                    return _responseHandler.NotFound<CartResponse>("Cart not found.");
                }
                var cartItem = cart.CartItems.FirstOrDefault(b => b.Id == request.CartItemId);
                if (cartItem == null)
                {
                    _logger.LogWarning("CartItem not found. CartItemId: {CartItemId}", request.CartItemId);
                    return _responseHandler.NotFound<CartResponse>("Cart item not found.");
                }

                cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                var response = CreateCartResponse(cart);
                _logger.LogInformation("Cart item quantity updated successfully for StudentId: {StudentId}", StudentId);
                return _responseHandler.Success(response, "Cart item quantity updated successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while updating cart item quantity for StudentId: {StudentId}", StudentId);
                return _responseHandler.InternalServerError<CartResponse>("An error occurred while updating cart item quantity.");
            }

        }
        private CartResponse CreateCartResponse(TechMeter.Domain.Models.Cart cart)
        {
            var cartItemResponse = cart.CartItems
                     .Select(c => new CartItemResponse
                     {
                         Id = c.Id,
                         //CartId = c.CartId,
                         CourseName = c.Course.Title,
                         CourseId = c.CourseId,
                         //CourseImageUrl = c.Course.CourseImage.FirstOrDefault(b => b.isPrimary == true)?.ImageUrl
                         //                      ?? c.Course.CourseImages.FirstOrDefault()?.ImageUrl
                         //                      ?? string.Empty,
                         UnitPrice = c.UnitPrice,
                     });


            var cartResponse = new CartResponse()
            {
                CartId = cart.Id,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cartItemResponse?.ToList(),
                TotalItems = cart.CartItems.Count(),
                TotalPrice = cart.CartItems.Sum(b => b.UnitPrice)
            };
            return cartResponse;
        }


    }
}
