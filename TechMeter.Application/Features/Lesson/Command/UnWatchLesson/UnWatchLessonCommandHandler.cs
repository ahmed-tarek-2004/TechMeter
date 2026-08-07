using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.UnWatchLesson
{
    public class UnWatchLessonCommandHandler(IApplicationDbContext context,ITransactionManager transactionManager, ResponseHandler responseHandler) : IRequestHandler<UnWatchLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(UnWatchLessonCommand request, CancellationToken cancellationToken)
        {
            var courseId = await context.Lessons.Where(l => l.Id == request.LessonId)
                               .Select(l => l.section.CourseId)
                               .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(courseId))
            {
                return responseHandler.NotFound<string>("Lesson not found");
            }
            await using var transaction = await transactionManager.BeginTransactionAsync();
            try
            {
                var deleted = await context.StudentLessonWatched
                    .Where(x => x.StudentId == request.StudentId && x.LessonId == request.LessonId)
                    .ExecuteDeleteAsync();

                if (deleted == 0)
                {
                    await transaction.CommitAsync();
                    return responseHandler.Success(string.Empty, "Lesson already unwatched");
                }


                var updatedProgress = await context.CourseStudent
                                      .Where(x => x.StudentId == request.StudentId && x.CourseId == courseId)
                                      .ExecuteUpdateAsync(b => b.SetProperty(x => x.Progrss, x => x.Progrss > 0 ? x.Progrss - 1 : 0));


                await transaction.CommitAsync();
                return responseHandler.Success("Updated", "Lesson status updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
