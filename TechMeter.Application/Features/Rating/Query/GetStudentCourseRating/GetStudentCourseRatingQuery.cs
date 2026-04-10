using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Query.GetStudentRating
{
    public sealed record GetStudentCourseRatingQuery(string StudentId, string CourseId) : IRequest<Response<StudentCourseRatingDto>>;
}
