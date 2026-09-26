using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.EditSectionOrder
{
    public class EditSectionOrderCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) :
        IRequestHandler<EditSectionOrderCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditSectionOrderCommand request, CancellationToken cancellationToken)
        {
            var courseExists = await context.Course.AnyAsync(b => b.Id == request.courseId);
            if (!courseExists)
            {
                return responseHandler.NotFound<string>("course is not found");
            }
            var sections = await context.Section.Where(b => b.CourseId == request.courseId).ToListAsync(cancellationToken);
            if (sections == null || !sections.Any())
            {
                return responseHandler.Success(string.Empty, "course Is Empty");

            }
            if (request.sectionsId.Distinct().Count() != request.sectionsId.Count())
            {
                return responseHandler.BadRequest<string>("Duplicate section IDs are not allowed.");
            }
            if (request.sectionsId.Count() != sections.Count())
            {
                return responseHandler.BadRequest<string>("The provided section do not match the course sections.");
            }
            var sectionsIds = sections.Select(b => b.Id).ToHashSet();
            if (!request.sectionsId.All(b => sectionsIds.Contains(b)))
            {
                return responseHandler.BadRequest<string>("One or more section do not belong to this course.");
            }
            var sectionsById = sections.ToDictionary(b => b.Id);
            for (int i = 0; i < request.sectionsId.Count(); i++)
            {
                sectionsById[request.sectionsId[i]].SectionOrder = i + 1;
            }
            await context.SaveChangesAsync(cancellationToken);
            return responseHandler.Success(string.Empty, "Sections Order Updated Successfully");
        }
    }
}
