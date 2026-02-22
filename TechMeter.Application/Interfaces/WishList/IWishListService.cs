using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.WishList
{
    public interface IWishListService
    {
        Task<Response<GetWishListResponse>> GetWishlistAsync(string studentId);
        Task<Response<GetWishListResponse>> AddToWishlistAsync(string studentId, AddToWishListRequest request);
        Task<Response<GetWishListResponse>> RemoveFromWishlistAsync(string studentId, string wishlistItemId);
        Task<Response<object>> ClearWishlistAsync(string studentId);
    }
}
