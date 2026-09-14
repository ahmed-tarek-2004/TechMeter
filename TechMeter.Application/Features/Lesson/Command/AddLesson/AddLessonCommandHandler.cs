using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.MediaUpload;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandHandler(IApplicationDbContext context, ITransactionManager transactionManager, ILogger<AddLessonCommandHandler> logger,
        IBackgroundJobService backgroundJobService, IMediaUploadService mediaUpload, ResponseHandler responseHandler) : IRequestHandler<AddLessonCommand, Response<string>>
    {
        private readonly string[] videoExtensions = new[] { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpeg", ".mpg", ".3gp", ".ts", ".mts", ".m2ts", ".ogv" };
        private readonly string[] imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" };

        public async Task<Response<string>> Handle(AddLessonCommand request, CancellationToken cancellationToken)
        {
            var section = await context.Section.FirstOrDefaultAsync(s => s.Id == request.SectionId);
            if (section == null)
            {
                return responseHandler.NotFound<string>("Section is not found");
            }
            string LessonUrl = string.Empty;


            var course = await context.Course.FirstOrDefaultAsync(b => b.Id == section.CourseId);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course is not found");
            }
            await using var transaction = await transactionManager.BeginTransactionAsync();
            try
            {
                var Lesson = new TechMeter.Domain.Models.Lessons()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.AddLessonRequest.Name,
                    Description = request.AddLessonRequest.Description,
                    SectionId = request.SectionId,
                    LessonUrl = string.Empty
                };

                await context.Lessons.AddAsync(Lesson);

                await context.Course
                    .Where(c => c.Id == section.CourseId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(c => c.LessonCount, c => c.LessonCount + 1));

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync();
                await UploadMedia(request.AddLessonRequest.LessonStream, Lesson.Id, cancellationToken);

                return responseHandler.Created("Lesson Created Successfully", $"Lesson {request.AddLessonRequest.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        private async Task UploadMedia(IFormFile file, string lessonId, CancellationToken cancellationToken)
        {
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            try
            {
                //if (videoExtensions.Contains(fileExtension))
                //{
                //    return backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadVideoAsync(file, cancellationToken));
                //}
                //else 
                if (imageExtensions.Contains(fileExtension))
                {
                    await mediaUpload.UploadLessonImage(file, lessonId, file.FileName, cancellationToken);
                }
                else
                {
                    throw new InvalidOperationException("Unsupported file type");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error uploading media file");
                throw new Exception("An error occurred while uploading the media file. Please try again later.");
            }
        }
    }
}
