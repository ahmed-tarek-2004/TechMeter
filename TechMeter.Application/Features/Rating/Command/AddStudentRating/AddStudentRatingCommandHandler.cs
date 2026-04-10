using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.AddStudentRating
{
    public class AddStudentRatingCommandHandler(IRatingService ratingService) : IRequestHandler<AddStudentRatingCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddStudentRatingCommand request, CancellationToken cancellationToken)
        {
            return await ratingService.AddRatingToCourse(request);
        }
    }
}
