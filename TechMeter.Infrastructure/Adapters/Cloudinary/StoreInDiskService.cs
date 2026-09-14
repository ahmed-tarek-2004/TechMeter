using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.MediaUpload;


namespace TechMeter.Infrastructure.Adapters.Cloudinary
{
    public class StoreInDiskService(IWebHostEnvironment webHostEnvironment, ILogger<StoreInDiskService> logger) : IStoreInDisk
    {
        public async Task<string> StoreImageAsync(IFormFile formFile, CancellationToken cancellationToken)
        {
            return await StoreFileAsync(formFile, "Images", cancellationToken);
        }
        public void DeleteFile(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                return;

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                logger.LogInformation($"File deleted: {filePath}");
            }
        }


        public async Task<string> StoreVideoAsync(IFormFile formFile, CancellationToken cancellationToken = default)
        {
            return await StoreFileAsync(formFile,"Videos",cancellationToken);
        }

        public async Task<string> StoreFileAsync(IFormFile formFile, CancellationToken cancellationToken = default)
        {
            return await StoreFileAsync(formFile, "Documents", cancellationToken);
        }

        private async Task<string> StoreFileAsync(IFormFile formFile, string folderName, CancellationToken cancellationToken)
        {
            var uploadPath = Path.Combine(webHostEnvironment.WebRootPath, folderName);

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName =$"{Guid.NewGuid()}{Path.GetExtension(formFile.FileName)}";

            var filePath = Path.Combine(uploadPath, fileName);

            await using var fileStream = new FileStream(filePath, FileMode.Create);

            await formFile.CopyToAsync(fileStream, cancellationToken);

            return filePath;
        }
    }
}
