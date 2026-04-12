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
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Lesson
{
    public class LessonService : ILessonService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly IImageUploading _imageUploading;
        private readonly ILogger<LessonService> _logger;
        private readonly INotificationService _notificationService;
        public LessonService(ApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<LessonService> logger, IImageUploading imageUploading, INotificationService notificationService)

        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;
            _notificationService = notificationService;
            _imageUploading = imageUploading;

        }
        public async Task<Response<GetLessonResponse>> AddLessonAsync(string sectionId, AddLessonRequest request)
        {
            var section = await _context.Section.FindAsync(sectionId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Section is not found");
            }
            string LessonUrl = string.Empty;
            try
            {
                LessonUrl = await _imageUploading.UploadVideoAsync(request.LessonStream);
            }
            catch (Exception ex)
            {
                return _responseHandler.BadRequest<GetLessonResponse>(ex.Message);
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
                await _context.Course.Where(b => b.Id == section.CourseId)
              .ExecuteUpdateAsync(b => b.SetProperty(c => c.LessonCount, lc => lc.LessonCount + 1));
                section.LessonCount += 1;
                await _context.AddAsync(Lesson);
                await _context.SaveChangesAsync();
                var response = CreateALessonResponse(Lesson);
                await transaction.CommitAsync();
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
                    LessonUrl = editLessonRequest.LessonUrl,
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
        public async Task<Response<List<GetLessonResponse>>> GetALLessonAsync()
        {
            var response = await _context.Lessons.Select(b => new GetLessonResponse()
            {
                Id = b.Id,
                Description = b.Description,
                LessonUrl = b.LessonUrl,
                Name = b.Name,
                SectionId = b.SectionId,
            }).ToListAsync();

            return _responseHandler.Success(response, "Lessons returned successfully");
        }
        public async Task<Response<GetLessonResponse>> GetLessonByIdAsync(string Id)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(b => b.Id == Id);
            if (lesson == null)
                return _responseHandler.NotFound<GetLessonResponse>("Lesson not found");
            var response = CreateALessonResponse(lesson!);
            return _responseHandler.Success(response, "Lesson returned successfully");
        }

        public async Task<Response<List<GetLessonResponse>>> GetSectionLessonResponse(string sectionId)
        {
            if (!await _context.Section.AnyAsync(s => s.Id == sectionId))
                return _responseHandler.NotFound<List<GetLessonResponse>>("Section is not found");

            var lessons = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.SectionId == sectionId)
                .Select(l => new GetLessonResponse
                {
                    SectionId = l.SectionId,
                    Id = l.Id,
                    Description = l.Description,
                    LessonUrl = l.LessonUrl,
                    Name = l.Name
                })
                .ToListAsync();

            return _responseHandler.Success(lessons, "Section lessons returned successfully");
        }
        public async Task<Response<string>> DeleteLessonAsync(string Id)
        {
            var Lesson = await _context.Lessons.FindAsync(Id);
            if (Lesson == null)
            {
                return _responseHandler.NotFound<string>("Lesson Not Found");
            }
            var section = await _context.Section.Where(b => b.Id == Lesson.SectionId).Select(b => new
            {
                Id = b.Id,
                CourseId = b.CourseId,
            }).FirstOrDefaultAsync();
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Section.Where(b => b.Id == section.Id)
                    .ExecuteUpdateAsync(b => b.SetProperty(s => s.LessonCount, s => s.LessonCount - 1));

                await _context.Course.Where(b => b.Id == section.CourseId)
                    .ExecuteUpdateAsync(b => b.SetProperty(s => s.LessonCount, s => s.LessonCount - 1));

                _context.Remove(Lesson);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Deleted<string>($"Lesson {Lesson.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        public async Task<Response<string>> StudentLessonWatched(string studentId, string lessonId)
        {

            var courseId = await _context.Lessons.Where(l => l.Id == lessonId)
                               .Select(l => l.section.CourseId)
                               .FirstOrDefaultAsync();
            if (string.IsNullOrEmpty(courseId))
            {
                return _responseHandler.NotFound<string>("Lesson not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var existing = await _context.StudentLessonWatched
                    .AnyAsync(x => x.StudentId == studentId && x.LessonId == lessonId);

                if (existing)
                {
                    return _responseHandler.Success(string.Empty, "Lesson already marked as watched");
                }

                await _context.StudentLessonWatched.AddAsync(new StudentLessonWatched
                {
                    LessonId = lessonId,
                    StudentId = studentId,
                    WatchedDate = DateTime.UtcNow
                });


                //await _context.SaveChangesAsync();


                await _context.CourseStudent.Where(b => b.StudentId == studentId && b.CourseId == courseId)
                            .ExecuteUpdateAsync(b => b.SetProperty(c => c.Progrss, c => c.Progrss + 1));

                var totalLessons = await _context.Lessons
                    .CountAsync(l => l.section.CourseId == courseId);

                var updatedProgress = await _context.CourseStudent
                                      .Where(x => x.StudentId == studentId && x.CourseId == courseId)
                                      .Select(x => x.Progrss)
                                      .FirstOrDefaultAsync();

                if (updatedProgress >= totalLessons)
                {
                    await StoreAndSendNotification(studentId, courseId);
                }


                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return _responseHandler.Success("Updated", "Lesson status updated successfully");
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
                    return _responseHandler.Success<string>(string.Empty, "Lesson  marked as unwatched");
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
            var lessons = await _context.StudentLessonWatched.Where(slw => slw.StudentId == studentId)
                .Select(slw => new GetLessonResponse
                {
                    Id = slw.Lessons.Id,
                    Description = slw.Lessons.Description,
                    LessonUrl = slw.Lessons.LessonUrl,
                    Name = slw.Lessons.Name,
                    SectionId = slw.Lessons.SectionId,
                }).AsNoTracking().ToListAsync();
            return _responseHandler.Success(lessons, "Lesson Watched Returned Successfully");
        }
        private GetLessonResponse CreateALessonResponse(TechMeter.Domain.Models.Lessons lesson)
        {
            var response = new GetLessonResponse()
            {
                Id = lesson.Id,
                Description = lesson.Description,
                LessonUrl = lesson.LessonUrl,
                Name = lesson.Name,
                SectionId = lesson.SectionId,
            };
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
            await _notificationService.FinishCourseNotification(
                        studentId,
                        "Finished Course",
                        $"Congratulations! You have completed course {courseId}.",
                        DateTime.UtcNow
                    );
            await _context.Notification.AddAsync(notification);
            //await _context.SaveChangesAsync();
        }
    }
}
