using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Rating;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Rating.Command.DeleteStudentRating
{
    public class DeleteStudentRatingCommandHandler(IRatingService ratingService) : IRequestHandler<DeleteStudentRatingCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteStudentRatingCommand request, CancellationToken cancellationToken)
        {
            return await ratingService.DeleteStudentCourseionRating(request);
        }
    }
}
