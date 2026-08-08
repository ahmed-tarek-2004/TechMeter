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
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Cart.Query.GetProviderStudentCart
{
    public class GetProviderStudentCartCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<GetProviderStudentCartCommand, Response<CartResponse>>
    {
        public async Task<Response<CartResponse>> Handle(GetProviderStudentCartCommand request, CancellationToken cancellationToken)
        {
            var Student = await context.Student.FindAsync(request.StudentId);
            if (Student == null)
            {
                return responseHandler.NotFound<CartResponse>("Student Not Found");
            }
            var Cart = await context.Cart
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Course)
                // .ThenInclude(p => p.CourseImages.Where(image => image.isPrimary == true))
                .Where(c => c.StudentId == request.StudentId && c.CartItems.Any(ci => ci.Course.ProviderId == request.ProviderId))
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
                return responseHandler.Success<CartResponse>(response, "Cart Is Empty");
            }
            var cartResponse = CreateCartResponse(Cart);
            return responseHandler.Success(cartResponse, $"Cart For Student {request.StudentId} return successfully");
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
