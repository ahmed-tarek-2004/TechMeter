using AutoMapper;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;

namespace TechMeter.API.Mapping.Cart
{
    public class CartProfile : Profile
    {
        public CartProfile()
        {
            CreateMap<CartRequest, AddToCartCommand>()
                .ForMember(des => des.StudentId, opt => opt.Ignore());
        }
    }
}
