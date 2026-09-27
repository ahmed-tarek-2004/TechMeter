using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Query.GetStudentCourseById
{
    public sealed record GetStudentCourseByIdCommand(string userId, string courseId):IRequest<Response<GetCourseLearningCurriculumDto>>;
}
