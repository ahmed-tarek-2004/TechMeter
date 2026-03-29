using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.DeleteStudentRating
{
    public sealed record DeleteStudentRatingCommand(string StudentId, string CourseId) : IRequest<Response<string>>;
    
}
