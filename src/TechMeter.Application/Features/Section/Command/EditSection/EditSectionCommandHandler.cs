using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.EditSection
{
    public class EditSectionCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<EditSectionCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditSectionCommand request, CancellationToken cancellationToken)
        {
            var provider = await context.Provider.FirstOrDefaultAsync(b => b.Id == request.providerId);
            if (provider == null)
            {
                return responseHandler.BadRequest<string>("Provider Is Not Found");
            }

            var Newcourse = await context.Course.FirstOrDefaultAsync(b => b.Id == request.editSectionRequest.courseId && b.ProviderId == request.providerId);
            if (Newcourse == null)
            {
                return responseHandler.NotFound<string>("NewCourse Is Not Found");
            }
            var section = await context.Section.FirstOrDefaultAsync(b => b.Id == request.Id && b.Course.ProviderId == request.providerId);
            if (section == null)
            {
                return responseHandler.NotFound<string>("Section is not found");
            }
            var isExists = await context.Section.AnyAsync(b => b.Name == request.editSectionRequest.name);
            if (isExists)
            {
                return responseHandler.BadRequest<string>("Section Name Is Exsists");
            }
            try
            {
                section.Name = request.editSectionRequest.name;
                section.CourseId = request.editSectionRequest.courseId;

                await context.SaveChangesAsync(cancellationToken);

                return responseHandler.Success(string.Empty, "Section is Edited Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }

        }
    }
}
