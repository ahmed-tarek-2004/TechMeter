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
    public class UploadBackgroundMediaJob(IStoreInDisk storeInDisk, ILogger<UploadBackgroundMediaJob> logger,
        ICloudMediaUploading mediaUploading, ApplicationDbContext context) : IUploadBackgroundMediaJob
    {
        public async Task UploadLessonImageJob(string Id, string name, string filePath, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!File.Exists(filePath))
                    throw new FileNotFoundException("Lesson image was not found.",filePath);

                var lesson = await context.Lessons.AnyAsync(l => l.Id == Id);
                if (!lesson)
                {
                    throw new Exception("Lesson not found");
                }
                var lessonUrl = await mediaUploading.UploadImageByURI(filePath, name, cancellationToken);

                await context.Lessons.Where(l => l.Id == Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(l => l.LessonUrl, lessonUrl), cancellationToken);

                 storeInDisk.DeleteFile(filePath);

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error saving image in Disk");
                throw new Exception("Error saving image in Disk", ex);
            }
        }
    }
}
