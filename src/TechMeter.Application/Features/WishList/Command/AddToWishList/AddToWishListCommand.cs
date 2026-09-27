using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.WhishList;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.WishList.Command.AddToWishList
{
    public sealed record AddToWishListCommand(string studentId, string courseId) : IRequest<Response<string>>;
}
