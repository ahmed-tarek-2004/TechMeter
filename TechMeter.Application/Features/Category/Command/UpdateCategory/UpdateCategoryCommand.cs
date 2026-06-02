using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Category;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.UpdateCategory
{
    public sealed record UpdateCategoryCommand(string id, string name, string description) : IRequest<Response<UpdateCategoryResponse>>;
}
