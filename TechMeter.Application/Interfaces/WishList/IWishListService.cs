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
        Task<Response<string>> AddToWishlistAsync(string studentId, string request);
        Task<Response<string>> RemoveFromWishlistAsync(string studentId, string wishlistItemId);
        Task<Response<string>> ClearWishlistAsync(string studentId);
    }
}
