using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.DeleteLesson
{
    public class DeleteLessonCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) :
        IRequestHandler<DeleteLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await context.Lessons
                .Include(b => b.section)
                .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
            if (lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson Is Not Found");
            }
            try
            {
                context.Lessons.Remove(lesson);

                await context.SaveChangesAsync(cancellationToken);

                await context.StudentLessonWatched
                    .Where(b => b.LessonId == lesson.Id)
                    .ExecuteDeleteAsync(cancellationToken);

                await context.Course
                    .Where(b => b.Id == lesson.section.CourseId)
                    .ExecuteUpdateAsync(b => b.SetProperty(b => b.LessonCount, b => b.LessonCount - 1), cancellationToken);

                await context.CourseStudent
                    .Where(b => b.CourseId == lesson.section.CourseId)
                    .ExecuteUpdateAsync(b => b.SetProperty(b => b.Progrss, b => b.Progrss - 1), cancellationToken);


                return responseHandler.Deleted<string>($"Lesson {lesson.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
