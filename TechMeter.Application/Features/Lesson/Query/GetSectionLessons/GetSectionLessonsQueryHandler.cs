using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetSectionLessons
{
    public class GetSectionLessonsQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetSectionLessonsQuery, Response<List<GetLessonResponse>>>
    {
        public async Task<Response<List<GetLessonResponse>>> Handle(GetSectionLessonsQuery request, CancellationToken cancellationToken)
        {
            if (!await context.Section.AnyAsync(s => s.Id == request.SectionId))
                return responseHandler.NotFound<List<GetLessonResponse>>("Section is not found");

            var lessons = await context.Lessons
                .AsNoTracking()
                .Where(l => l.SectionId == request.SectionId)
                .Select(b => new GetLessonResponse()
                {
                    Id = b.Id,
                    Description = b.Description,
                    //LessonUrl = lesson.LessonUrl,
                    Name = b.Name,
                    SectionId = b.SectionId,
                }).ToListAsync();

            return responseHandler.Success(lessons, "Section lessons returned successfully");
        }
    }
}
