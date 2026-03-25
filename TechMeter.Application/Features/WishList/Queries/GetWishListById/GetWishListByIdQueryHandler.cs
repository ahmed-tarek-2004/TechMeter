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
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Queries.GetWishListById
{
    public class GetWishListByIdQueryHandler : IRequestHandler<GetWishListByIdQuery, Response<GetWishListResponse>>
    {
        private readonly IWishListService _wishListService;
        public GetWishListByIdQueryHandler(IWishListService wishListService)
        {
            _wishListService = wishListService;
        }

        public async Task<Response<GetWishListResponse>> Handle(GetWishListByIdQuery request, CancellationToken cancellationToken)
        {
            return await _wishListService.GetWishlistAsync(request.studentId);
        }
    }
}
