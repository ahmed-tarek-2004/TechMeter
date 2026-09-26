using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command
{
    public class EditLessonOrderCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<EditLessonOrderCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditLessonOrderCommand request, CancellationToken cancellationToken)
        {
            var sesionExists = await context.Section.AnyAsync(b => b.Id == request.SectionId);
            if (!sesionExists)
            {
                return responseHandler.NotFound<string>("Section Is not found");
            }
            var lessons = await context.Lessons
                .Where(b => b.SectionId == request.SectionId)
                .ToListAsync(cancellationToken);

            if (lessons == null)
            {
                return responseHandler.Success(string.Empty, "Section Is Empty");
            }

            if (request.LessonsId.Distinct().Count() != request.LessonsId.Count)
                return responseHandler.BadRequest<string>("Duplicate lesson IDs are not allowed.");

            if (lessons.Count() != request.LessonsId.Count())
            {
                return responseHandler.BadRequest<string>("The provided lessons do not match the section lessons.");
            }

            var lessonsIds = lessons
                .Select(b => b.Id)
                .ToHashSet();

            if (!request.LessonsId.All(b => lessonsIds.Contains(b)))
                return responseHandler.BadRequest<string>("One or more lessons do not belong to this section.");

            var lessonsById = lessons.ToDictionary(x => x.Id);

            for (int i = 0; i < request.LessonsId.Count; i++)
            {
                var lessonId = request.LessonsId[i];

                lessonsById[lessonId].LessonOrder = i + 1;
            }
            await context.SaveChangesAsync(cancellationToken);
            return responseHandler.Success(string.Empty, "Lessons Order Updated Successfully");
        }
    }
}
