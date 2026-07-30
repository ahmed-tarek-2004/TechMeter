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
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Query.GetStudentCart
{
    public class GetStudentCartQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<GetStudentCartQuery, Response<CartResponse>>
    {
        public async Task<Response<CartResponse>> Handle(GetStudentCartQuery request, CancellationToken cancellationToken)
        {
            var user = await context.Student.FirstOrDefaultAsync(b => b.Id == request.StudentId);
            if (user == null)
            {
                return responseHandler.NotFound<CartResponse>("User Not Found");
            }
            try
            {
                var cart = await context.Cart
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                        //.ThenInclude(p => p.CourseImages.Where(image => image.isPrimary == true))
                        //.AsSplitQuery()
                        .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.StudentId == request.StudentId);

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
                    return responseHandler.Success<CartResponse>(cartResponse, "Cart Is Empty");
                }

                var response = CreateCartResponse(cart);
                return responseHandler.Success<CartResponse>(response, "Cart Returned Successfully");

            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
                return responseHandler.InternalServerError<CartResponse>("Internal Server Error");
            }
        }
        private CartResponse CreateCartResponse(TechMeter.Domain.Models.Cart cart)
        {
            var cartItemResponse = cart.CartItems
                     .Select(c => new CartItemResponse
                     {
                         Id = c.Id,
                         CourseName = c.Course.Title,
                         CourseId = c.CourseId,
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
