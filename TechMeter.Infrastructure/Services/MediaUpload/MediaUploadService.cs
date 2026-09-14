using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Helper;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.MediaUpload;
using TechMeter.Domain.Enums;
using TechMeter.Infrastructure.Persistence.AppDbContext;

namespace TechMeter.Infrastructure.Services.UploadBackgroundMedia
{
    public class MediaUploadService(IStoreInDisk storeInDisk, ILogger<MediaUploadService> logger,
        IBackgroundJobService backgroundJobService) : IMediaUploadService
    {

        public async Task UploadLessonMedia(IFormFile file, string Id, string name, CancellationToken cancellationToken = default)
        {
            try
            {
                var filePath = string.Empty;
                if (MediaExtension.GetMediaType(file.FileName) == MediaType.Image)
                {
                    filePath = await storeInDisk.StoreImageAsync(file, cancellationToken);
                }
                else if (MediaExtension.GetMediaType(file.FileName) == MediaType.Video)
                {
                    filePath = await storeInDisk.StoreVideoAsync(file, cancellationToken);
                }
                else if (MediaExtension.GetMediaType(file.FileName) == MediaType.File)
                {
                    filePath = await storeInDisk.StoreFileAsync(file, cancellationToken);
                }
                else
                {
                    throw new Exception("Unsupported media type. Only images , videos and ICDL Files are allowed.");
                }
                filePath = await storeInDisk.StoreImageAsync(file, cancellationToken);
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
            try
            {
                backgroundJobService.Enqueue<IUploadBackgroundMediaJob>(j => j.UploadLessonMediaJob(Id, name, filePath, cancellationToken));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error uploading media file");
                throw new Exception("An error occurred while uploading the media file. Please try again later.");
            }
        }


    }
}