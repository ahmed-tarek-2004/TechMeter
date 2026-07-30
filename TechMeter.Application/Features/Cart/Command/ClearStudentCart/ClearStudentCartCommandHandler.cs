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
//using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.ClearStudentCart
{
    public class ClearStudentCartCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<ClearStudentCartCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(ClearStudentCartCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Student.FirstOrDefaultAsync(b => b.Id == request.StudentId);
            if (user == null)
            {
                logger.LogWarning("Student not found for StudentId: {StudentId}", request.StudentId);
                return responseHandler.NotFound<string>("Student not found.");
            }
            try
            {
                var cart = await context.Cart
               .Include(x => x.CartItems)
               .FirstOrDefaultAsync(b => b.StudentId == request.StudentId);
                if (cart == null)
                {
                    logger.LogWarning("Cart not found for request.StudentId: {request.StudentId}", request.StudentId);
                    return responseHandler.NotFound<string>("Cart not found.");
                }
                var cartItem = cart.CartItems.FirstOrDefault();
                if (cartItem == null)
                {
                    logger.LogWarning("CartItem not found. Cart: {CartId}", cart.Id);
                    return responseHandler.NotFound<string>($"no CartItem found. Cart: {cart.Id}");
                }
                if (cart.CartItems == null || !cart.CartItems.Any())
                    return responseHandler.BadRequest<string>("Cart is already empty.");


                context.CartItem.RemoveRange(cart.CartItems);
                cart.CartItems.Clear();
                cart.UpdatedAt = DateTime.UtcNow;

                await context.SaveChangesAsync(cancellationToken);


                logger.LogInformation("Cart item removed successfully for request.StudentId: {request.StudentId}", request.StudentId);
                return responseHandler.Deleted<string>("Cart item removed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while removing cart item for request.StudentId: {request.StudentId}", request.StudentId);
                return responseHandler.InternalServerError<string>("An error occurred while removing cart item.");
            }
        }
    
    }
}
