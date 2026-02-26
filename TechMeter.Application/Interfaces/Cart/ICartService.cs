using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Cart
{
    public interface ICartService
    {
        Task<Response<CartResponse>> GetCartAsync(string StudentId);
        Task<Response<CartResponse>> GetProviderCartAsync(string ProviderId, string StudentId);
        Task<Response<CartResponse>> AddToCartAsync(string CartId, CartRequest request);
        Task<Response<CartResponse>> RemoveFromCartAsync(string StudentId, string cartItemId);
        Task<Response<CartResponse>> UpdateCartAsync(string StudentId, UpdateCartItemRequest request);
        Task<Response<CartResponse>> ClearStudentCartAsync(string StudentId);
    }
}
