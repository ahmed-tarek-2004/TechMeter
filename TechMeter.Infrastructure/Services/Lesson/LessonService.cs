using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces;
//using TechMeter.Application.Interfaces.Notification;
using TechMeter.Application.Interfaces.Services;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Application.Interfaces.Services.NotificationSender;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Lesson
{
    public class LessonService : ILessonService
    {
        private readonly string[] videoExtensions = new[] { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpeg", ".mpg", ".3gp", ".ts", ".mts", ".m2ts", ".ogv" };
        private readonly string[] imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" };
        private readonly ApplicationDbContext _context;
        private readonly IBackgroundJobService _backgroundJobService;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<LessonService> _logger;
        private readonly INotificationSenderService _notificationService;
        public LessonService(ApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<LessonService> logger, IBackgroundJobService backgroundJobService, INotificationSenderService notificationService)

        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
            _backgroundJobService = backgroundJobService;
            _notificationService = notificationService;
        }
        public async Task<Response<GetLessonResponse>> AddLessonAsync(string sectionId, AddLessonRequest request)
        {
            var section = await _context.Section.FirstOrDefaultAsync(s => s.Id == sectionId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Section is not found");
            }
            string LessonUrl = string.Empty;
            try
            {
                LessonUrl = await UploadMedia(request.LessonStream);
            }
            catch (Exception ex)
            {
                return _responseHandler.BadRequest<GetLessonResponse>(ex.Message);
            }

            var course = await _context.Course.FirstOrDefaultAsync(b => b.Id == section.CourseId);
            if (course == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Course is not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Lesson = new TechMeter.Domain.Models.Lessons()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.Name,
                    Description = request.Description,
                    SectionId = sectionId,
                    LessonUrl = LessonUrl
                };

                await _context.AddAsync(Lesson);

                await _context.Course
                    .Where(c => c.Id == section.CourseId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(c => c.LessonCount, c => c.LessonCount + 1));

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                var response = new GetLessonResponse()
                {
                    Id = Lesson.Id,
                    Name = Lesson.Name,
                    Description = Lesson.Description,
                    LessonUrl = Lesson.LessonUrl
                };
                return _responseHandler.Created(response, $"Lesson {request.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetLessonResponse>(ex.Message);
            }
        }
        public async Task<Response<GetLessonResponse>> EditLessonAsync(string Id, EditLessonRequest editLessonRequest)
        {
            var Lesson = await _context.Lessons
              .FirstOrDefaultAsync(b => b.Id == Id);

            if (Lesson == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Lesson Not Found");
            }
            var section = await _context.Section.FindAsync(editLessonRequest.SectionId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Section Not Found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                Lesson.Description = editLessonRequest.Description;
                Lesson.Name = editLessonRequest.Name;
                Lesson.SectionId = editLessonRequest.SectionId;
                await _context.SaveChangesAsync();

                var response = new GetLessonResponse()
                {
                    Id = Id,
                    //LessonUrl = editLessonRequest.LessonUrl,
                    SectionId = editLessonRequest.SectionId,
                    Description = Lesson.Description,
                    Name = Lesson.Name,

                };
                await transaction.CommitAsync();
                return _responseHandler.Success(response, $"Lesson {response.Name} updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetLessonResponse>(ex.Message);
            }
        }
        public async Task<Response<List<GetLessonResponse>>> GetCourseLessonsAsync(string courseId)
        {
            var lessons = _context.Lessons
                .AsNoTracking()
                .Where(l => l.section.CourseId == courseId)
                .AsQueryable();
            var respone = await CreateALessonResponse(lessons);
            return _responseHandler.Success(respone, "Course lessons returned successfully");
        }
        public async Task<Response<GetLessonResponse>> GetLessonByIdAsync(string Id)
        {
            var lesson = _context.Lessons.Where(b => b.Id == Id).AsQueryable();
            var response = await CreateALessonResponse(lesson);
            if (response.FirstOrDefault() == null)
                return _responseHandler.NotFound<GetLessonResponse>("Lesson is not found");

            return _responseHandler.Success(response.FirstOrDefault()!, "Lesson returned successfully");
        }
        public async Task<Response<List<GetLessonResponse>>> GetSectionLessonResponse(string sectionId)
        {
            if (!await _context.Section.AnyAsync(s => s.Id == sectionId))
                return _responseHandler.NotFound<List<GetLessonResponse>>("Section is not found");

            var lessons = _context.Lessons
                .AsNoTracking()
                .Where(l => l.SectionId == sectionId)
                .AsQueryable();

            return _responseHandler.Success(await CreateALessonResponse(lessons), "Section lessons returned successfully");
        }
        public async Task<Response<string>> DeleteLessonAsync(string Id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var lesson = await _context.Lessons.FirstOrDefaultAsync(b => b.Id == Id);
            if (lesson == null)
            {
                return _responseHandler.NotFound<string>("Lesson Not Found");
            }
            try
            {
                _context.Remove(lesson);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Deleted<string>($"Lesson {lesson.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }
        public async Task<Response<string>> StudentLessonWatched(string studentId, string lessonId)
        {
            var courseInfo = await _context.Lessons
                .Where(l => l.Id == lessonId)
                .Select(l => new
                {
                    l.section.CourseId,
                    l.section.Course.LessonCount
                })
                .FirstOrDefaultAsync();

            if (courseInfo == null)
                return _responseHandler.NotFound<string>("Lesson not found");

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var exists = await _context.StudentLessonWatched
                    .AnyAsync(x =>
                        x.StudentId == studentId &&
                        x.LessonId == lessonId);

                if (exists)
                    return _responseHandler.Success("", "Already watched");

                await _context.StudentLessonWatched.AddAsync(new StudentLessonWatched
                {
                    LessonId = lessonId,
                    StudentId = studentId,
                    WatchedDate = DateTime.UtcNow
                });

                await _context.CourseStudent
                    .Where(x =>
                        x.StudentId == studentId &&
                        x.CourseId == courseInfo.CourseId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(p => p.Progrss, p => p.Progrss + 1));

                var updatedProgress = await _context.CourseStudent
                    .Where(x =>
                        x.StudentId == studentId &&
                        x.CourseId == courseInfo.CourseId)
                    .Select(x => x.Progrss)
                    .FirstAsync();

                if (updatedProgress >= courseInfo.LessonCount)
                {
                    await StoreAndSendNotification(studentId,courseInfo.CourseId);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return _responseHandler.Success(
                    "Updated",
                    "Lesson status updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }
        public async Task<Response<string>> StudentLessonUnwatched(string studentId, string LessonId)
        {
            var courseId = await _context.Lessons.Where(l => l.Id == LessonId)
                               .Select(l => l.section.CourseId)
                               .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(courseId))
            {
                return _responseHandler.NotFound<string>("Lesson not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var deleted = await _context.StudentLessonWatched
                    .Where(x => x.StudentId == studentId && x.LessonId == LessonId)
                    .ExecuteDeleteAsync();

                if (deleted == 0)
                {
                    await transaction.CommitAsync();
                    return _responseHandler.Success(string.Empty, "Lesson already unwatched");
                }


                var updatedProgress = await _context.CourseStudent
                                      .Where(x => x.StudentId == studentId && x.CourseId == courseId)
                                      .ExecuteUpdateAsync(b => b.SetProperty(x => x.Progrss, x => x.Progrss > 0 ? x.Progrss - 1 : 0));


                await transaction.CommitAsync();
                return _responseHandler.Success("Updated", "Lesson status updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }
        public async Task<Response<List<GetLessonResponse>>> GetStudentLessonWatched(string studentId)
        {
            var lessons = await _context.StudentLessonWatched
                .Where(slw => slw.StudentId == studentId)
                .Select(b => new GetLessonResponse
                {
                    Id = b.LessonId,
                    Description = b.Lessons.Description,
                    //LessonUrl = b.lesson.LessonUrl,
                    Name = b.Lessons.Name,
                    SectionId = b.Lessons.SectionId,
                }).ToListAsync();
            return _responseHandler.Success(lessons, "Lesson Watched Returned Successfully");
        }
        private async Task<List<GetLessonResponse>> CreateALessonResponse(IQueryable<TechMeter.Domain.Models.Lessons> lesson)
        {
            var response = await lesson.Select(b => new GetLessonResponse()
            {
                Id = b.Id,
                Description = b.Description,
                //LessonUrl = lesson.LessonUrl,
                Name = b.Name,
                SectionId = b.SectionId,
            }).ToListAsync();
            return response;
        }
        private async Task StoreAndSendNotification(string studentId, string courseId)
        {
            var notification = new Domain.Models.Notification
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Finished Course",
                Message = $"Congratulations! You have completed the course {courseId}.",
                CreatedAt = DateTime.UtcNow
            };
            await _notificationService.SendNotificationAsync(
                        studentId,
                        "Finished Course",
                        $"Congratulations! You have completed course {courseId}.",
                        DateTime.UtcNow
                    );
            await _context.Notification.AddAsync(notification);
            //await _context.SaveChangesAsync();
        }
        private async Task<string> UploadMedia(IFormFile file)
        {
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            try
            {
                if (videoExtensions.Contains(fileExtension))
                {
                    return _backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadVideoAsync(file));
                }
                else if (imageExtensions.Contains(fileExtension))
                {
                    return _backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadAsync(file));
                }
                else
                {
                    throw new InvalidOperationException("Unsupported file type");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading media file");
                throw new Exception("An error occurred while uploading the media file. Please try again later.");
            }
        }
    }
}
