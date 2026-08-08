using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.RemoveCartItem
{
    public class RemoveCartItemCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<RemoveCartItemCommand, Response<string>>
    {
        
        public async Task<Response<string>> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Student.FirstOrDefaultAsync(b => b.Id == request.studentId);
            if (user == null)
            {
                logger.LogWarning("Student not found for StudentId: {StudentId}", request.studentId);
                return responseHandler.NotFound<string>("Student not found.");
            }
            try
            {
                var cart = await context.Cart
               .Include(x => x.CartItems.Where(b => b.Id == request.cartItemId))
               // .ThenInclude(c => c.Course)
               .FirstOrDefaultAsync(b => b.StudentId == request.studentId);
                if (cart == null)
                {
                    logger.LogWarning("Cart not found for StudentId: {StudentId}", request.studentId);
                    return responseHandler.NotFound<string>("no Cart has found for studnet.");
                }
                var cartItem = cart.CartItems.FirstOrDefault();
                if (cartItem == null)
                {
                    logger.LogWarning("CartItem not found. Cart: {CartId}", cart.Id);
                    return responseHandler.NotFound<string>($"no CartItem found. Cart: {cart.Id}");
                }
                context.CartItem.Remove(cartItem);
                cart.UpdatedAt = DateTime.UtcNow;

                await context.SaveChangesAsync(cancellationToken);

                //var response = CreateCartResponse(cart);
                logger.LogInformation("Cart item removed successfully for StudentId: {StudentId}", request.studentId);
                return responseHandler.Deleted<string>("Cart item removed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while removing cart item for StudentId: {StudentId}", request.studentId);
                return responseHandler.InternalServerError<string>("An error occurred while removing cart item.");
            }
        }
    }
}
