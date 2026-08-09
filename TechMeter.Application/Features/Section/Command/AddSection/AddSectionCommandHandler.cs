using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Section.Command.AddSection
{
    public class AddSectionCommandHandler(IApplicationDbContext context,ResponseHandler responseHandler) : IRequestHandler<AddSectionCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddSectionCommand request, CancellationToken cancellationToken)
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
            var isExists = await context.Section.AnyAsync(b => b.Name == request.sectionName);
            if (isExists)
            {
                return responseHandler.BadRequest<string>("Section Name Is Exsists");
            }
            try
            {
                var Section = new Sections()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.sectionName,
                    CourseId = request.courseId
                };
                course.SectionCount += 1;
                await context.Section.AddAsync(Section);
                await context.SaveChangesAsync(cancellationToken);



                return responseHandler.Created(string.Empty, "Section is Created Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
