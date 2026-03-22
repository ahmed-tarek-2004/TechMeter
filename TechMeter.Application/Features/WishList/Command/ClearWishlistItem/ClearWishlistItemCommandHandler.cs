using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.ClearWishlistItem
{
    public class ClearWishlistItemCommandHandler : IRequestHandler<ClearWishlistItemCommand, Response<string>>
    {
        private readonly IWishListService _wishListService;
        public ClearWishlistItemCommandHandler(IWishListService wishListService)
        {
            _wishListService = wishListService;
        }
        public async Task<Response<string>> Handle(ClearWishlistItemCommand request, CancellationToken cancellationToken)
        {
           return await _wishListService.ClearWishlistAsync(request.studentId);
        }
    }
}
