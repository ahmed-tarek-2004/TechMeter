using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Features.WishList.Command.RemoveFromWishlistItem;
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.RemoveFromWishlist
{
    public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, Response<string>>
    {
        private readonly IWishListService _wishListService;
        public RemoveFromWishlistCommandHandler(IWishListService wishListService)
        {
            _wishListService = wishListService;
        }

        public async Task<Response<string>> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
        {
            return await _wishListService.RemoveFromWishlistAsync(request.studentId, request.wishlistItemId);
        }
    }
}
