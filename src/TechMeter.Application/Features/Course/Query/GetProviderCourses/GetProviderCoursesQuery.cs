using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetProviderCourses
{
    public sealed record GetProviderCoursesQuery(string Id) : IRequest<Response<List<GetCourseResponse>>>;
}
