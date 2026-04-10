using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.DeleteCourse
{
    public sealed record DeleteCourseCommand(string responsibleId, string courseId) : IRequest<Response<string>>;
}
