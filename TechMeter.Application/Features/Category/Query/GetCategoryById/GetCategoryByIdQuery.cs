using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Query.GetCategoryById
{
    public sealed record GetCategoryByIdQuery(string Id) : IRequest<Response<GetCategoryDto>>;
}
