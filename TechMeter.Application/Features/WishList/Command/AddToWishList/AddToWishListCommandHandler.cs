using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Application.Interfaces.WishList;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.AddToWishList
{
    public class AddToWishListCommandHandler : IRequestHandler<AddToWishListCommand, Response<string>>
    {
        private readonly IWishListService _wishListService;
        public AddToWishListCommandHandler(IWishListService wishListService)
        {
            _wishListService = wishListService;
        }
        public async Task<Response<string>> Handle(AddToWishListCommand command, CancellationToken cancellationToken)
        {
          return await _wishListService.AddToWishlistAsync(command.studentId, command.courseId);
        }
    }
}
