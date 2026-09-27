using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.EditStudentRating
{
    public class EditStudentRatingCommand:IRequest<Response<string>>
    {
        public string StudentId { get; set; }
        public EditStudentRatingRequest editStudentRatingRequest { get; set; }
    }
}
