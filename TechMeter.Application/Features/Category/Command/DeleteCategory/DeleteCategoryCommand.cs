using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Category.Command.DeleteCategory
{
    public sealed record DeleteCategoryCommand(string categoryId) : IRequest<Response<string>>;
}
