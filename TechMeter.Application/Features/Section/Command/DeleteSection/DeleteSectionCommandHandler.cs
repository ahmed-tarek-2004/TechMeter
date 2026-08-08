using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.DeleteSection
{
    public class DeleteSectionCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<DeleteSectionCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteSectionCommand request, CancellationToken cancellationToken)
        {
            var provider = await context.Provider.FirstOrDefaultAsync(b => b.Id == request.providerId);
            if (provider == null)
            {
                return responseHandler.BadRequest<string>("Provider Is Not Found");
            }

            var course = await context.Course.FirstOrDefaultAsync(b => b.Id == request.courseId && b.ProviderId == request.providerId);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course Is Not Found");
            }
            var section = await context.Section.FirstOrDefaultAsync(b => b.Id == request.sectionId && b.CourseId == request.courseId);
            if (section == null)
            {
                return responseHandler.NotFound<string>("Section is not found");
            }
            try
            {
                course.SectionCount -= 1;
                context.Section.Remove(section);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success("", "Section is Deleted Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
