using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Services.Cart
{
    public interface ICartService
    {
        Task<Response<CartResponse>> GetCartAsync(string StudentId);
        Task<Response<CartResponse>> GetProviderCartAsync(string ProviderId, string StudentId);
        Task<Response<string>> AddToCartAsync(string studentId,string courseId);
        Task<Response<string>> RemoveFromCartAsync(string StudentId, string cartItemId);
        //Task<Response<CartResponse>> UpdateCartAsync(string StudentId, UpdateCartItemRequest request);
        Task<Response<string>> ClearStudentCartAsync(string StudentId);
    }
}
