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
using TechMeter.Application.Interfaces.Services;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandHandler(IApplicationDbContext context,ITransactionManager transactionManager,ILogger<AddLessonCommandHandler> logger, 
        IBackgroundJobService backgroundJobService,ResponseHandler responseHandler) : IRequestHandler<AddLessonCommand, Response<GetLessonResponse>>
    {
        private readonly string[] videoExtensions = new[] { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpeg", ".mpg", ".3gp", ".ts", ".mts", ".m2ts", ".ogv" };
        private readonly string[] imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" };

        public async Task<Response<GetLessonResponse>> Handle(AddLessonCommand request, CancellationToken cancellationToken)
        {
            var section = await context.Section.FirstOrDefaultAsync(s => s.Id == request.SectionId);
            if (section == null)
            {
                return responseHandler.NotFound<GetLessonResponse>("Section is not found");
            }
            string LessonUrl = string.Empty;
            try
            {
                LessonUrl = await UploadMedia(request.AddLessonRequest.LessonStream);
            }
            catch (Exception ex)
            {
                return responseHandler.BadRequest<GetLessonResponse>(ex.Message);
            }

            var course = await context.Course.FirstOrDefaultAsync(b => b.Id == section.CourseId);
            if (course == null)
            {
                return responseHandler.NotFound<GetLessonResponse>("Course is not found");
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
                    LessonUrl = LessonUrl
                };

                await context.Lessons.AddAsync(Lesson);

                await context.Course
                    .Where(c => c.Id == section.CourseId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(c => c.LessonCount, c => c.LessonCount + 1));

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync();
                var response = new GetLessonResponse()
                {
                    Id = Lesson.Id,
                    Name = Lesson.Name,
                    Description = Lesson.Description,
                    LessonUrl = Lesson.LessonUrl
                };
                return responseHandler.Created(response, $"Lesson {request.AddLessonRequest.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<GetLessonResponse>(ex.Message);
            }
        }

        private async Task<string> UploadMedia(IFormFile file)
        {
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            try
            {
                if (videoExtensions.Contains(fileExtension))
                {
                    return backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadVideoAsync(file));
                }
                else if (imageExtensions.Contains(fileExtension))
                {
                    return backgroundJobService.Enqueue<IMediaUploading>(service => service.UploadAsync(file));
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
