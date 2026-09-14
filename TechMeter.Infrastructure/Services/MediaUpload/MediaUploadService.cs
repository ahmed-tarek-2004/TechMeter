using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.MediaUpload;
using TechMeter.Infrastructure.Persistence.AppDbContext;

namespace TechMeter.Infrastructure.Services.UploadBackgroundMedia
{
    public class MediaUploadService(IStoreInDisk storeInDisk, ILogger<MediaUploadService> logger,
        IBackgroundJobService backgroundJobService) : IMediaUploadService
    {
        private readonly string[] videoExtensions = new[] { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpeg", ".mpg", ".3gp", ".ts", ".mts", ".m2ts", ".ogv" };
        private readonly string[] imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" };

        public async Task UploadLessonMedia(IFormFile file, string Id, string name, CancellationToken cancellationToken = default)
        {
            try
            {
                var filePath = await storeInDisk.StoreImageAsync(file, cancellationToken);
                await UploadMedia(file, Id, filePath, name, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error uploading image asynchronously");
                throw new Exception("Error uploading image asynchronously", ex);
            }
        }

        private async Task UploadMedia(IFormFile file, string Id, string filePath, string name, CancellationToken cancellationToken)
        {
            var fileExtension = Path.GetExtension(filePath).ToLower();
            try
            {
                //if (videoExtensions.Contains(fileExtension))
                //{
                    // Use the concrete background-job service interface instead of "I"
                    backgroundJobService.Enqueue<IUploadBackgroundMediaJob>(j => j.UploadLessonVideoJob(Id, name, filePath, cancellationToken));
                //}
                //else 
                    if (imageExtensions.Contains(fileExtension))
                {
                    backgroundJobService.Enqueue<IUploadBackgroundMediaJob>(j => j.UploadLessonImageJob(Id, name, filePath, cancellationToken));
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