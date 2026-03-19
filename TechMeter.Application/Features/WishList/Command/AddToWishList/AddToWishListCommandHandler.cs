using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.AddToWishList
{
    public class AddToWishListCommandHandler : IRequestHandler<AddToWishListCommand, Response<string>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        public AddToWishListCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler)
        {
            _context = context;
            _responseHandler = responseHandler;
        }
        public async Task<Response<string>> Handle(AddToWishListCommand command, CancellationToken cancellationToken)
        {
            var student = await _context.Student.FindAsync(command.studentId);
            if (student == null)
            {
                return _responseHandler.NotFound<string>("student is not found");
            }
            var Course = await _context.Course
                //.Include(p => p.)
                .FirstOrDefaultAsync(p => p.Id == command.courseId);
            if (Course == null)
                return _responseHandler.NotFound<string>("Course not found");

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {

                var wishlist = await _context.Wishlist
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
                    await _context.Wishlist.AddAsync(wishlist);
                }
                else
                {
                    if (wishlist.WishlistItems.Any(wi => wi.courseId == command.courseId))
                        return _responseHandler.BadRequest<string>("Course is already in wishlist");
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

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync();


                return _responseHandler.Success(string.Empty, $"Course {Course.Title} added to wishlist");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>("Failed to add Course to wishlist");
            }

        }
    }
}
