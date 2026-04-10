using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetCategoryById
{
    public sealed record GetCourseByIdQuery(string Id) : IRequest<Response<GetCourseResponse>>;
}
