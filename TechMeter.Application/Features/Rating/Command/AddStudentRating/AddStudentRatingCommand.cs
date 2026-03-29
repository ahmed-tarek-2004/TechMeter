using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.AddStudentRating
{
    public sealed class AddStudentRatingCommand() : IRequest<Response<string>>
    {
        public string StudentId { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;
    }
}
