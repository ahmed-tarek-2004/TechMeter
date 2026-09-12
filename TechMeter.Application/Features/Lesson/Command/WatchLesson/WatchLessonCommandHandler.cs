using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Application.Interfaces.Services.NotificationSender;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.ChangeLessonState
{
    public class WatchLessonCommandHandler(IApplicationDbContext context, ITransactionManager transactionManager
        ,ResponseHandler responseHandler, INotificationService notificationService, ILogger<WatchLessonCommandHandler> logger) 
        : IRequestHandler<WatchLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(WatchLessonCommand request, CancellationToken cancellationToken)
        {
            var courseInfo = await context.Lessons
               .Where(l => l.Id == request.LessonId)
               .Select(l => new
               {
                   l.section.CourseId,
                   l.section.Course.LessonCount,
                   l.section.Course.Title
               })
               .FirstOrDefaultAsync();

            if (courseInfo == null)
                return responseHandler.NotFound<string>("Lesson not found");

            await using var transaction = await transactionManager.BeginTransactionAsync();

            try
            {
                var exists = await context.StudentLessonWatched
                    .AnyAsync(x =>
                        x.StudentId == request.StudentId &&
                        x.LessonId == request.LessonId);

                if (exists)
                    return responseHandler.Success(string.Empty, "Already watched");

                await context.StudentLessonWatched.AddAsync(new StudentLessonWatched
                {
                    LessonId = request.LessonId,
                    StudentId = request.StudentId,
                    WatchedDate = DateTime.UtcNow
                });

                await context.CourseStudent
                    .Where(x =>
                        x.StudentId == request.StudentId &&
                        x.CourseId == courseInfo.CourseId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(p => p.Progrss, p => p.Progrss + 1));

                logger.LogInformation("Updated progress for student {StudentId} watching lesson {LessonId} in course {CourseId}.", request.StudentId, request.LessonId, courseInfo.CourseId);

                var updatedProgress = await context.CourseStudent
                    .Where(x =>
                        x.StudentId == request.StudentId &&
                        x.CourseId == courseInfo.CourseId)
                    .Select(x => x.Progrss)
                    .FirstAsync();

                if (updatedProgress >= courseInfo.LessonCount)
                {
                    await StoreAndSendNotification(request.StudentId, courseInfo.Title);
                }

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync();

                return responseHandler.Success(
                    "Updated",
                    "Lesson status updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
        private async Task StoreAndSendNotification(string studentId, string courseTitle)
        {
            await notificationService.SendUserNotifications(
                        studentId,
                        "Finished Course",
                        $"Congratulations! You have completed {courseTitle} course.",
                        Domain.Enums.NotificationType.FinishCourse
                    );
            //await context.Notification.AddAsync(notification);
            //await _context.SaveChangesAsync();
        }   
    }
}
