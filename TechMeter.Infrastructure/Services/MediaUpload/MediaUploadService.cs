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
        IBackgroundJobService backgroundJobService): IMediaUploadService
    {
        public async Task UploadLessonImage(IFormFile file, string Id, string name, CancellationToken cancellationToken = default)
        {
            try
            {
                var filePath = await storeInDisk.StoreFileAsync(file, cancellationToken);
                backgroundJobService.Enqueue<IUploadBackgroundMediaJob>(j => j.UploadLessonImageJob(Id, name, filePath, cancellationToken));

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error uploading image asynchronously");
                throw new Exception("Error uploading image asynchronously", ex);
            }
        }
    }
}
