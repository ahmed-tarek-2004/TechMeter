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
using TechMeter.Application.Features.Cart.Command.AddToCart;
//using TechMeter.Application.Interfaces.Services.WishList;
//using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.AddToWishList
{
    public class AddToWishListCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        ILogger<AddToCartCommandHandler> logger) : IRequestHandler<AddToWishListCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddToWishListCommand command, CancellationToken cancellationToken)
        {
            var student = await context.Student.FindAsync(command.studentId);
            if (student == null)
            {
                return responseHandler.NotFound<string>("student is not found");
            }
            var Course = await context.Course
                //.Include(p => p.)
                .FirstOrDefaultAsync(p => p.Id == command.courseId);
            if (Course == null)
                return responseHandler.NotFound<string>("Course not found");

            try
            {

                var wishlist = await context.Wishlist
                    .Include(w => w.WishlistItems)
                    .FirstOrDefaultAsync(w => w.StudentId == command.studentId);

                if (wishlist == null)
                {
                    wishlist = new Wishlist
                    {
                        Id = Guid.NewGuid().ToString(),
                        StudentId = command.studentId,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow
                    };
                    await context.Wishlist.AddAsync(wishlist);
                }
                else
                {
                    if (wishlist.WishlistItems.Any(wi => wi.courseId == command.courseId))
                        return responseHandler.BadRequest<string>("Course is already in wishlist");
                }

                var item = new WishlistItem
                {
                    Id = Guid.NewGuid().ToString(),
                    WishlistId = wishlist.Id,
                    courseId = command.courseId,
                    CreatedAt = DateTime.UtcNow
                };

                wishlist.WishlistItems.Add(item);
                wishlist.LastUpdated = DateTime.UtcNow;

                await context.SaveChangesAsync(cancellationToken);


                return responseHandler.Success(string.Empty, $"Course {Course.Title} added to wishlist");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("Failed to add Course to wishlist");
            }
        }
    }
}
