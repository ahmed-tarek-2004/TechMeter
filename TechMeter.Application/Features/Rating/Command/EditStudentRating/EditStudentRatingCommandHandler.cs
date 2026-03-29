using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.EditStudentRating
{
    public class EditStudentRatingCommandHandler(IRatingService ratingService) : IRequestHandler<EditStudentRatingCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditStudentRatingCommand request, CancellationToken cancellationToken)
        {
           return await ratingService.EditRatingToCourse(request);
        }
    }
}
