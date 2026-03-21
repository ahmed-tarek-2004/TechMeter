using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.ClearWishlistItem
{
    public class ClearWishlistItemCommandHandler : IRequestHandler<ClearWishlistItemCommand, Response<string>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<ClearWishlistItemCommandHandler> _logger;
        public ClearWishlistItemCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<ClearWishlistItemCommandHandler> logger)
        {
            _responseHandler = responseHandler;
            _context = context;
            _logger = logger;
        }
        public async Task<Response<string>> Handle(ClearWishlistItemCommand request, CancellationToken cancellationToken)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var rows = await _context.WishlistItem.Where(b => b.Wishlist.StudentId == request.studentId).ExecuteDeleteAsync(cancellationToken);
                if (rows == 0)
                {
                    return _responseHandler.Success<string>(null, "Wishlist is already empty");
                }
                await _context.Wishlist.Where(b => b.StudentId == request.studentId)
                    .ExecuteUpdateAsync(b => b.SetProperty(p => p.LastUpdated, DateTime.UtcNow));

                await transaction.CommitAsync();

                return _responseHandler.Deleted<string>("Wishlist cleared successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error clearing wishlist for Student {StudentId}", request.studentId);
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
