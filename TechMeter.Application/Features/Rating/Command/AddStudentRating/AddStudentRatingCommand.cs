using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.AddStudentRating
{
    public sealed class AddStudentRatingCommand() : IRequest<Response<string>>
    {
        public string studentId { get; set; } = string.Empty;
        public AddStudentRatingRequest addStudentRatingRequest {  get; set; }
    }
}
