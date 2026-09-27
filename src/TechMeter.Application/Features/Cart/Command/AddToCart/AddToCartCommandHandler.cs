using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
//using TechMeter.Application.Interfaces.Services.Cart;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Command.AddToCart
{
    public class AddToCartCommandHandler(IApplicationDbContext context,ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler>logger) : IRequestHandler<AddToCartCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddToCartCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var Course = await context.Course.FirstOrDefaultAsync(p => p.Id == request.CourseId, cancellationToken);
                if (Course == null)
                {
                    return responseHandler.BadRequest<string>("Course is not found");
                }

                var isEnrolled = await context.CourseStudent
                    .AnyAsync(cs => cs.StudentId == request.StudentId && cs.CourseId == request.CourseId, cancellationToken);
                if (isEnrolled)
                {
                    return responseHandler.BadRequest<string>("You are already enrolled in this course");
                }

                var cart = await context.Cart
                    .Include(b => b.CartItems)
                    //.ThenInclude(b => b.Course)
                    .FirstOrDefaultAsync(c => c.StudentId == request.StudentId, cancellationToken);

                if (cart == null)
                {
                    cart = new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        StudentId = request.StudentId,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                    };
                    await context.Cart.AddAsync(cart);
                }
                if (cart.CartItems == null)
                {
                    cart.CartItems = new List<CartItem>();
                }
                var existingCartItem = cart.CartItems.Any(b => b.CourseId == request.CourseId);
                if (existingCartItem == false)
                {
                    var CartItem = new CartItem()
                    {
                        Id = Guid.NewGuid().ToString(),
                        CourseId = request.CourseId,
                        UnitPrice = Course.Price,
                        CreatedAt = DateTime.Now,
                        CartId = cart.Id,
                    };
                    cart.CartItems.Add(CartItem);
                }
                else
                {
                    return responseHandler.Success(string.Empty, "Course is already in your cart");
                }

                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "Course added to cart successfully");

            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                logger.LogError(ex.Message);
                return responseHandler.InternalServerError<string>(ex.Message);
            }

        }
    }
}
